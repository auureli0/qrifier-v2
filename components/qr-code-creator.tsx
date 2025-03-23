"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, FormInput, Plus, QrCode, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-sonner"
import { createQrCode } from "@/server/qr-codes"
import { QRCodeService } from "@/lib/qr-service"
import { getUserForms } from "@/server/forms"
import type { FormData } from "@/types/form"

export function QrCodeCreator() {
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("")
  const [forms, setForms] = useState<FormData[]>([])
  const [isLoadingForms, setIsLoadingForms] = useState(true)
  
  // QR-Code-Eigenschaften
  const [qrName, setQrName] = useState("")
  const [location, setLocation] = useState("")
  const [formId, setFormId] = useState("")
  const [color, setColor] = useState("#3b82f6")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [size, setSize] = useState(200)
  const [logoUrl, setLogoUrl] = useState<string>("")
  const [active, setActive] = useState(true)
  
  // Formulare laden
  useEffect(() => {
    const loadForms = async () => {
      try {
        setIsLoadingForms(true)
        const result = await getUserForms()
        
        if (result.success) {
          setForms(result.data || [])
        } else {
          console.error("Fehler beim Laden der Formulare:", result.error)
        }
      } catch (error) {
        console.error("Fehler beim Laden der Formulare:", error)
      } finally {
        setIsLoadingForms(false)
      }
    }

    loadForms()
  }, [])
  
  // QR-Code erzeugen und aktualisieren
  useEffect(() => {
    const generateQRCode = async () => {
      if (qrName.length > 0 && location.length > 0) {
        try {
          // Wir erstellen eine temporäre URL für den QR-Code
          // Die eigentliche URL wird später mit der tatsächlichen ID aktualisiert
          const tempUrl = "https://example.com/feedback/preview"
          
          const dataURL = await QRCodeService.generateQRCodeDataURL(tempUrl, {
            color,
            backgroundColor: bgColor,
            size,
            logoUrl: logoUrl || undefined
          })
          
          setQrCodeDataURL(dataURL)
        } catch (error) {
          console.error("Fehler bei der QR-Code-Generierung:", error)
        }
      }
    }
    
    generateQRCode()
  }, [qrName, location, color, bgColor, size, logoUrl])
  
  // Logo-Upload-Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Sicherheitsvalidierung für erlaubte Dateiendungen
      const validFileTypes = ['image/jpeg', 'image/png', 'image/svg+xml']
      if (!validFileTypes.includes(file.type)) {
        toast({
          title: "Ungültiges Dateiformat",
          description: "Bitte nur JPG, PNG oder SVG Bilder hochladen.",
          variant: "destructive"
        })
        return
      }
      
      // Größenvalidierung (max. 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Datei zu groß",
          description: "Das Logo darf maximal 2MB groß sein.",
          variant: "destructive"
        })
        return
      }
      
      // Logo als Daten-URL laden
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogoUrl(result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  // QR-Code speichern
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!qrName.trim() || !location) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte gib einen Namen und einen Standort an.",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      formData.append("name", qrName)
      formData.append("location", location)
      formData.append("color", color)
      formData.append("backgroundColor", bgColor)
      formData.append("size", size.toString())
      formData.append("active", active.toString())
      
      if (formId) {
        formData.append("formId", formId)
      }
      
      if (logoUrl) {
        formData.append("logoUrl", logoUrl)
      }
      
      const result = await createQrCode(formData)
      
      if (result.success) {
        toast({
          title: "QR-Code erstellt",
          description: "Dein QR-Code wurde erfolgreich erstellt."
        })
        router.push("/dashboard/qr-codes")
      } else {
        toast({
          title: "Fehler",
          description: result.error || "QR-Code konnte nicht erstellt werden.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Fehler beim Speichern des QR-Codes:", error)
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // PDF-Download
  const handlePdfDownload = async () => {
    if (!qrCodeDataURL || !qrName || !location) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte fülle alle Pflichtfelder aus, bevor du ein PDF erstellst.",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Standorte für die Anzeige im PDF formatieren
      const locations: Record<string, string> = {
        main: "Hauptfiliale",
        downtown: "Innenstadt-Filiale",
        westside: "Westside Store",
        airport: "Flughafen Kiosk",
        all: "Alle Standorte"
      };
      
      const locationDisplay = locations[location] || location;
      
      // PDF generieren
      const pdfBlob = await QRCodeService.generateQRCodePDF({
        dataURL: qrCodeDataURL,
        name: qrName,
        location: locationDisplay
      })
      
      // PDF herunterladen
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `qr-code-${qrName.toLowerCase().replace(/\s+/g, '-')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({
        title: "PDF erstellt",
        description: "Dein PDF wurde erfolgreich erstellt und heruntergeladen"
      })
    } catch (error) {
      console.error("Fehler beim Erstellen des PDFs:", error)
      toast({
        title: "Fehler",
        description: "PDF konnte nicht erstellt werden",
        variant: "destructive"
      })
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/qr-codes">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Zurück</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">QR-Code erstellen</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>QR-Code-Details</CardTitle>
                <CardDescription>Gib die grundlegenden Informationen für deinen QR-Code ein</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">QR-Code-Name</Label>
                  <Input
                    id="name"
                    placeholder="z.B. Tische Restaurant XYZ"
                    value={qrName}
                    onChange={(e) => setQrName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Standort</Label>
                  <Select value={location} onValueChange={setLocation} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Wähle einen Standort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Hauptfiliale</SelectItem>
                      <SelectItem value="downtown">Innenstadt-Filiale</SelectItem>
                      <SelectItem value="westside">Westside Store</SelectItem>
                      <SelectItem value="airport">Flughafen Kiosk</SelectItem>
                      <SelectItem value="all">Alle Standorte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="form">Verknüpftes Formular</Label>
                  <div className="flex flex-col space-y-2">
                    <Select value={formId} onValueChange={setFormId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Wähle ein Formular (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingForms ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Formulare werden geladen...
                          </div>
                        ) : forms.length === 0 ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Keine Formulare vorhanden
                          </div>
                        ) : (
                          forms.map(form => (
                            <SelectItem key={form.id} value={form.id}>
                              {form.name} ({form.type === "feedback" ? "Feedback" : "Beschwerde"})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex justify-end">
                      <Button variant="link" size="sm" asChild className="h-auto p-0">
                        <Link href="/dashboard/forms/new">
                          <Plus className="mr-1 h-3 w-3" />
                          Neues Formular erstellen
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div>
                    <Label>QR-Code-Design</Label>
                    <Tabs defaultValue="colors" className="mt-2">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="colors">Farben</TabsTrigger>
                        <TabsTrigger value="logo">Logo</TabsTrigger>
                      </TabsList>
                      <TabsContent value="colors" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="color">QR-Code-Farbe</Label>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-6 w-6 rounded border"
                              style={{ backgroundColor: color }}
                            ></div>
                            <Input
                              id="color"
                              type="color"
                              value={color}
                              onChange={(e) => setColor(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bgColor">Hintergrundfarbe</Label>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-6 w-6 rounded border"
                              style={{ backgroundColor: bgColor }}
                            ></div>
                            <Input
                              id="bgColor"
                              type="color"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="size">Größe</Label>
                            <span className="text-sm text-muted-foreground">{size}px</span>
                          </div>
                          <Slider
                            id="size"
                            value={[size]}
                            min={100}
                            max={400}
                            step={10}
                            onValueChange={(value) => setSize(value[0])}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="logo" className="pt-4">
                        <div className="space-y-4">
                          <Label>Firmenlogo (optional)</Label>
                          {logoUrl ? (
                            <div className="space-y-2">
                              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-4">
                                <Image 
                                  src={logoUrl} 
                                  alt="Logo" 
                                  width={100} 
                                  height={100} 
                                  className="mb-2 max-h-24 w-auto object-contain" 
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setLogoUrl("")}
                                >
                                  Logo entfernen
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Für beste Ergebnisse verwende ein quadratisches Bild mit transparentem Hintergrund
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
                              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                              <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                Logo hochladen
                              </Button>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/svg+xml"
                                className="hidden"
                                onChange={handleLogoUpload}
                              />
                              <p className="mt-2 text-xs text-muted-foreground">
                                JPG, PNG oder SVG, max. 2MB
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={active}
                    onCheckedChange={setActive}
                  />
                  <Label htmlFor="active">QR-Code sofort aktivieren</Label>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/qr-codes">Abbrechen</Link>
                </Button>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePdfDownload}
                    disabled={!qrCodeDataURL || !qrName || !location}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    PDF herunterladen
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Wird erstellt..." : "QR-Code erstellen"}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
        
        <Card className="md:sticky md:top-20">
          <CardHeader>
            <CardTitle>QR-Code-Vorschau</CardTitle>
            <CardDescription>So wird dein QR-Code aussehen</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {qrCodeDataURL ? (
              <>
                <div className="flex h-64 w-64 items-center justify-center rounded-lg border p-4">
                  <Image 
                    src={qrCodeDataURL} 
                    alt="QR-Code Vorschau" 
                    width={size} 
                    height={size} 
                    className="max-h-full max-w-full" 
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="font-medium">{qrName || "QR-Code Name"}</p>
                  <p className="text-sm text-muted-foreground">
                    {location === "main" 
                      ? "Hauptfiliale" 
                      : location === "downtown" 
                        ? "Innenstadt-Filiale" 
                        : location === "westside"
                          ? "Westside Store"
                          : location === "airport"
                            ? "Flughafen Kiosk"
                            : location === "all"
                              ? "Alle Standorte"
                              : "Standort auswählen"}
                  </p>
                  {formId && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <FormInput className="h-3 w-3" />
                      <span>
                        {forms.find(f => f.id === formId)?.name || "Formular verknüpft"}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-64 w-64 flex-col items-center justify-center rounded-lg border border-dashed">
                <QrCode className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-center text-sm text-muted-foreground">
                  Fülle die Pflichtfelder aus, <br />um eine Vorschau zu sehen
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

