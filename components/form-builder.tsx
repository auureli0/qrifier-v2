"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, GripVertical, Plus, Star, Trash2, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-sonner"
import { FormComponentType, FormType, FormData } from "@/types/form"
import { createForm, getFormById, updateForm } from "@/server/forms"

interface FormBuilderProps {
  formId?: string;
}

export function FormBuilder({ formId }: FormBuilderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formName, setFormName] = useState("")
  const [formType, setFormType] = useState<FormType>("feedback")
  const [components, setComponents] = useState<FormComponentType[]>([
    {
      id: "1",
      type: "rating",
      label: "Wie würden Sie Ihr Gesamterlebnis bewerten?",
      required: true,
    },
    {
      id: "2",
      type: "text",
      label: "Haben Sie weitere Kommentare oder Anregungen?",
      required: false,
    },
  ])

  // Formular laden, wenn bearbeitet wird
  useEffect(() => {
    const loadForm = async () => {
      if (!formId) return
      
      try {
        setIsLoading(true)
        const result = await getFormById(formId)
        
        if (result.success && result.data) {
          setFormName(result.data.name)
          setFormType(result.data.type)
          setComponents(result.data.components)
        } else {
          toast({
            title: "Fehler",
            description: result.error || "Formular konnte nicht geladen werden",
            variant: "destructive"
          })
          router.push("/dashboard/forms")
        }
      } catch (error) {
        console.error("Fehler beim Laden des Formulars:", error)
        toast({
          title: "Fehler",
          description: "Formular konnte nicht geladen werden",
          variant: "destructive"
        })
        router.push("/dashboard/forms")
      } finally {
        setIsLoading(false)
      }
    }

    loadForm()
  }, [formId, router, toast])

  const addComponent = (type: "rating" | "text" | "choice") => {
    const newComponent: FormComponentType = {
      id: Date.now().toString(),
      type,
      label: type === "rating" 
        ? "Wie würden Sie dies bewerten?" 
        : type === "text" 
          ? "Ihr Feedback" 
          : "Wählen Sie eine Option",
      required: false,
      options: type === "choice" ? ["Option 1", "Option 2", "Option 3"] : undefined,
    }

    setComponents([...components, newComponent])
  }

  const removeComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id))
  }

  const updateComponent = (id: string, updates: Partial<FormComponentType>) => {
    setComponents(components.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const handleSaveForm = async () => {
    // Validierung
    if (!formName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Namen für dein Formular ein",
        variant: "destructive"
      })
      return
    }

    if (components.length === 0) {
      toast({
        title: "Fehler",
        description: "Dein Formular benötigt mindestens eine Komponente",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSaving(true)
      
      if (formId) {
        // Formular aktualisieren
        const result = await updateForm({
          id: formId,
          name: formName,
          type: formType,
          components
        })
        
        if (result.success) {
          toast({
            title: "Erfolg",
            description: "Formular wurde erfolgreich aktualisiert"
          })
          router.push("/dashboard/forms")
        } else {
          toast({
            title: "Fehler",
            description: result.error || "Formular konnte nicht aktualisiert werden",
            variant: "destructive"
          })
        }
      } else {
        // Neues Formular erstellen
        const result = await createForm({
          name: formName,
          type: formType,
          components
        })
        
        if (result.success) {
          toast({
            title: "Erfolg",
            description: "Formular wurde erfolgreich erstellt"
          })
          router.push("/dashboard/forms")
        } else {
          toast({
            title: "Fehler",
            description: result.error || "Formular konnte nicht erstellt werden",
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error("Fehler beim Speichern des Formulars:", error)
      toast({
        title: "Fehler",
        description: "Formular konnte nicht gespeichert werden",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/forms">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Zurück</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {formId ? "Formular bearbeiten" : "Formular erstellen"}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">Formular wird geladen...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Formular-Details</CardTitle>
                <CardDescription>Gib die grundlegenden Informationen für dein Formular ein</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Formularname</Label>
                  <Input
                    id="name"
                    placeholder="z.B. Kundenfeedback-Formular"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Formulartyp</Label>
                  <div className="flex items-center space-x-2">
                    <Tabs value={formType} onValueChange={(value) => setFormType(value as FormType)} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="feedback">Feedback</TabsTrigger>
                        <TabsTrigger value="complaint">Beschwerde</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Formular-Komponenten</CardTitle>
                <CardDescription>Füge Komponenten zu deinem Formular hinzu und ordne sie an</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => addComponent("rating")}>
                    <Star className="mr-2 h-4 w-4" />
                    Bewertung hinzufügen
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addComponent("text")}>
                    <Type className="mr-2 h-4 w-4" />
                    Textfeld hinzufügen
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addComponent("choice")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Multiple Choice hinzufügen
                  </Button>
                </div>

                <div className="space-y-4">
                  {components.map((component) => (
                    <div key={component.id} className="flex items-start gap-2 rounded-md border p-4">
                      <div className="mt-1 cursor-move text-muted-foreground">
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`label-${component.id}`}>Frage</Label>
                          <Input
                            id={`label-${component.id}`}
                            value={component.label}
                            onChange={(e) => updateComponent(component.id, { label: e.target.value })}
                          />
                        </div>

                        {component.type === "choice" && (
                          <div className="space-y-2">
                            <Label>Optionen</Label>
                            <div className="space-y-2">
                              {component.options?.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...(component.options || [])]
                                      newOptions[index] = e.target.value
                                      updateComponent(component.id, { options: newOptions })
                                    }}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const newOptions = [...(component.options || [])].filter((_, i) => i !== index)
                                      updateComponent(component.id, { options: newOptions })
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newOptions = [...(component.options || []), "Neue Option"]
                                  updateComponent(component.id, { options: newOptions })
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Option hinzufügen
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`required-${component.id}`}
                            checked={component.required}
                            onCheckedChange={(checked) => updateComponent(component.id, { required: checked })}
                          />
                          <Label htmlFor={`required-${component.id}`}>Pflichtfeld</Label>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeComponent(component.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Entfernen</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/forms">Abbrechen</Link>
                </Button>
                <Button onClick={handleSaveForm} disabled={isSaving}>
                  {isSaving ? "Wird gespeichert..." : formId ? "Formular aktualisieren" : "Formular speichern"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card className="md:sticky md:top-20">
            <CardHeader>
              <CardTitle>Formular-Vorschau</CardTitle>
              <CardDescription>Vorschau, wie dein Formular für Kunden aussehen wird</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-6">
                <h2 className="text-xl font-bold">{formName || "Dein Formularname"}</h2>
                <p className="text-sm text-muted-foreground">
                  {formType === "feedback"
                    ? "Wir schätzen Ihr Feedback! Bitte teilen Sie uns Ihre Erfahrungen mit."
                    : "Es tut uns leid, dass Sie ein Problem hatten. Bitte teilen Sie uns mit, was schiefgelaufen ist."}
                </p>

                <div className="mt-6 space-y-6">
                  {components.map((component) => (
                    <div key={component.id} className="space-y-2">
                      <Label>
                        {component.label}
                        {component.required && <span className="ml-1 text-destructive">*</span>}
                      </Label>

                      {component.type === "rating" && (
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Button key={star} variant="outline" size="icon" className="h-10 w-10">
                              <Star className="h-5 w-5" />
                            </Button>
                          ))}
                        </div>
                      )}

                      {component.type === "text" && <Textarea placeholder="Geben Sie hier Ihr Feedback ein..." />}

                      {component.type === "choice" && (
                        <div className="space-y-2">
                          {component.options?.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input type="radio" id={`option-${index}`} name={`choice-${component.id}`} />
                              <Label htmlFor={`option-${index}`}>{option}</Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Button className="w-full">Absenden</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

