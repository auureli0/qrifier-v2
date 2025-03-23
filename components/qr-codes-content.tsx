"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Download, Edit, Eye, Plus, QrCode, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { deleteQrCode, getUserQrCodes, toggleQrCodeStatus } from "@/server/qr-codes"
import { QRCodeData } from "@/types/qr-code"
import { QRCodeService } from "@/lib/qr-service"

export function QrCodesContent() {
  const { toast } = useToast()
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [qrCodeToDelete, setQrCodeToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // QR-Codes laden
  useEffect(() => {
    const loadQrCodes = async () => {
      try {
        setIsLoading(true)
        const result = await getUserQrCodes()
        
        if (result.success) {
          // Konvertiere null zu undefined für Kompatibilität mit QRCodeData
          const convertedData = (result.data || []).map(qr => ({
            ...qr,
            formId: qr.formId || undefined,
            logoUrl: qr.logoUrl || undefined
          }));
          setQrCodes(convertedData)
        } else {
          toast({
            title: "Fehler",
            description: result.error || "QR-Codes konnten nicht geladen werden",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Fehler beim Laden der QR-Codes:", error)
        toast({
          title: "Fehler",
          description: "QR-Codes konnten nicht geladen werden",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadQrCodes()
  }, [toast])

  // QR-Code löschen
  const handleDeleteQrCode = async () => {
    if (!qrCodeToDelete) return
    
    try {
      setIsDeleting(true)
      const result = await deleteQrCode(qrCodeToDelete)
      
      if (result.success) {
        toast({
          title: "QR-Code gelöscht",
          description: "Der QR-Code wurde erfolgreich gelöscht"
        })
        // QR-Code aus der Liste entfernen
        setQrCodes(qrCodes.filter(qr => qr.id !== qrCodeToDelete))
      } else {
        toast({
          title: "Fehler",
          description: result.error || "QR-Code konnte nicht gelöscht werden",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Fehler beim Löschen des QR-Codes:", error)
      toast({
        title: "Fehler",
        description: "QR-Code konnte nicht gelöscht werden",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setQrCodeToDelete(null)
    }
  }

  // QR-Code-Status umschalten
  const handleToggleStatus = async (id: string) => {
    try {
      const result = await toggleQrCodeStatus(id)
      
      if (result.success) {
        // QR-Code in der Liste aktualisieren
        setQrCodes(qrCodes.map(qr => 
          qr.id === id ? { ...qr, active: !qr.active } : qr
        ))
        
        toast({
          title: "Status geändert",
          description: "Der QR-Code-Status wurde erfolgreich geändert"
        })
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Status konnte nicht geändert werden",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Fehler beim Ändern des QR-Code-Status:", error)
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden",
        variant: "destructive"
      })
    }
  }

  // QR-Code herunterladen
  const handleDownloadQrCode = async (qrCode: QRCodeData) => {
    try {
      // Feedback-URL für den QR-Code generieren
      const feedbackUrl = QRCodeService.createFeedbackURL(qrCode.id)
      
      // QR-Code generieren
      const dataURL = await QRCodeService.generateQRCodeDataURL(feedbackUrl, {
        color: qrCode.color,
        backgroundColor: qrCode.backgroundColor,
        size: qrCode.size,
        logoUrl: qrCode.logoUrl
      })
      
      // PDF generieren
      const locations: Record<string, string> = {
        main: "Hauptfiliale",
        downtown: "Innenstadt-Filiale",
        westside: "Westside Store",
        airport: "Flughafen Kiosk",
        all: "Alle Standorte"
      };
      
      const locationDisplay = locations[qrCode.location] || qrCode.location;
      
      const pdfBlob = await QRCodeService.generateQRCodePDF({
        dataURL,
        name: qrCode.name,
        location: locationDisplay
      })
      
      // PDF herunterladen
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `qr-code-${qrCode.name.toLowerCase().replace(/\s+/g, '-')}.pdf`
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

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return new Intl.DateTimeFormat("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR-Codes</h1>
          <p className="text-muted-foreground">Verwalte und erstelle QR-Codes für deine Feedback-Formulare</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/qr-codes/new">
            <Plus className="mr-2 h-4 w-4" />
            QR-Code erstellen
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deine QR-Codes</CardTitle>
          <CardDescription>Verwalte alle deine QR-Codes an einem Ort</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-muted-foreground">QR-Codes werden geladen...</p>
            </div>
          ) : qrCodes.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center space-y-4">
              <QrCode className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">Keine QR-Codes vorhanden</h3>
                <p className="text-sm text-muted-foreground">
                  Erstelle deinen ersten QR-Code, um Feedback von deinen Kunden zu sammeln.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/qr-codes/new">
                  <Plus className="mr-2 h-4 w-4" />
                  QR-Code erstellen
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QR-Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Standort</TableHead>
                  <TableHead className="hidden md:table-cell">Erstellt</TableHead>
                  <TableHead>Scans</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qrCodes.map((qrCode) => (
                  <TableRow key={qrCode.id}>
                    <TableCell>
                      <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
                        <QrCode className="h-8 w-8 text-muted-foreground" style={{ color: qrCode.color }} />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{qrCode.name}</TableCell>
                    <TableCell>
                      {qrCode.location === "all" 
                        ? "Alle Standorte" 
                        : qrCode.location === "main" 
                          ? "Hauptfiliale"
                          : qrCode.location === "downtown"
                            ? "Innenstadt-Filiale"
                            : qrCode.location === "westside"
                              ? "Westside Store"
                              : qrCode.location === "airport"
                                ? "Flughafen Kiosk"
                                : qrCode.location}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(qrCode.createdAt)}</TableCell>
                    <TableCell>{qrCode.scans.toLocaleString('de-DE')}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={qrCode.active ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleToggleStatus(qrCode.id)}
                      >
                        {qrCode.active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Aktionen</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/qr-codes/edit/${qrCode.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Bearbeiten
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadQrCode(qrCode)}>
                            <Download className="mr-2 h-4 w-4" />
                            Herunterladen
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => setQrCodeToDelete(qrCode.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Lösch-Dialog */}
      <AlertDialog open={!!qrCodeToDelete} onOpenChange={(open) => !open && setQrCodeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>QR-Code löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du diesen QR-Code löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteQrCode} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Wird gelöscht..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

