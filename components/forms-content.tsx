"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Copy, Edit, FormInput, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { FormData } from "@/types/form"
import { deleteForm, getUserForms, toggleFormStatus } from "@/server/forms"

export function FormsContent() {
  const { toast } = useToast()
  const [forms, setForms] = useState<FormData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formToDelete, setFormToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Formulare laden
  useEffect(() => {
    const loadForms = async () => {
      try {
        setIsLoading(true)
        const result = await getUserForms()
        
        if (result.success) {
          setForms(result.data || [])
        } else {
          toast({
            title: "Fehler",
            description: result.error || "Formulare konnten nicht geladen werden",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Fehler beim Laden der Formulare:", error)
        toast({
          title: "Fehler",
          description: "Formulare konnten nicht geladen werden",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadForms()
  }, [toast])

  // Formular löschen
  const handleDeleteForm = async () => {
    if (!formToDelete) return
    
    try {
      setIsDeleting(true)
      const result = await deleteForm(formToDelete)
      
      if (result.success) {
        toast({
          title: "Formular gelöscht",
          description: "Das Formular wurde erfolgreich gelöscht"
        })
        // Formular aus der Liste entfernen
        setForms(forms.filter(form => form.id !== formToDelete))
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Formular konnte nicht gelöscht werden",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Fehler beim Löschen des Formulars:", error)
      toast({
        title: "Fehler",
        description: "Formular konnte nicht gelöscht werden",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setFormToDelete(null)
    }
  }

  // Formular-Status umschalten
  const handleToggleStatus = async (id: string) => {
    try {
      const result = await toggleFormStatus(id)
      
      if (result.success) {
        // Formular in der Liste aktualisieren
        setForms(forms.map(form => 
          form.id === id ? { ...form, active: !form.active } : form
        ))
        
        toast({
          title: "Status geändert",
          description: "Der Formularstatus wurde erfolgreich geändert"
        })
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Status konnte nicht geändert werden",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Fehler beim Ändern des Formularstatus:", error)
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden",
        variant: "destructive"
      })
    }
  }

  // Formular duplizieren
  const handleDuplicateForm = (formId: string) => {
    // Hier könnte die Logik zum Duplizieren eines Formulars implementiert werden
    toast({
      title: "In Entwicklung",
      description: "Diese Funktion wird in Kürze verfügbar sein"
    })
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
          <h1 className="text-3xl font-bold tracking-tight">Formulare</h1>
          <p className="text-muted-foreground">Erstelle und verwalte deine Feedback-Formulare</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/forms/new">
            <Plus className="mr-2 h-4 w-4" />
            Formular erstellen
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deine Formulare</CardTitle>
          <CardDescription>Verwalte alle deine Feedback-Formulare an einem Ort</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-muted-foreground">Formulare werden geladen...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center space-y-4">
              <FormInput className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">Keine Formulare vorhanden</h3>
                <p className="text-sm text-muted-foreground">
                  Erstelle dein erstes Formular, um Feedback von deinen Kunden zu sammeln.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/forms/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Formular erstellen
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead className="hidden md:table-cell">Erstellt</TableHead>
                  <TableHead>Antworten</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">{form.name}</TableCell>
                    <TableCell>
                      <Badge variant={form.type === "complaint" ? "destructive" : "secondary"}>
                        {form.type === "complaint" ? "Beschwerde" : "Feedback"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(form.createdAt)}</TableCell>
                    <TableCell>{form.responses.toLocaleString('de-DE')}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={form.active ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleToggleStatus(form.id)}
                      >
                        {form.active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <FormInput className="h-4 w-4" />
                            <span className="sr-only">Aktionen</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/forms/${form.id}`}>
                              <FormInput className="mr-2 h-4 w-4" />
                              Anzeigen
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/forms/edit/${form.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Bearbeiten
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateForm(form.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplizieren
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => setFormToDelete(form.id)}
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
      <AlertDialog open={!!formToDelete} onOpenChange={(open) => !open && setFormToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Formular löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du dieses Formular löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteForm} 
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

