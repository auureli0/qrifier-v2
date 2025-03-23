"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, GripVertical, Plus, Star, Trash2, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type FormComponentType = {
  id: string
  type: "rating" | "text" | "choice"
  label: string
  required: boolean
  options?: string[]
}

export function FormBuilder() {
  const [formName, setFormName] = useState("")
  const [formType, setFormType] = useState("feedback")
  const [components, setComponents] = useState<FormComponentType[]>([
    {
      id: "1",
      type: "rating",
      label: "How would you rate your overall experience?",
      required: true,
    },
    {
      id: "2",
      type: "text",
      label: "Do you have any additional comments?",
      required: false,
    },
  ])

  const addComponent = (type: "rating" | "text" | "choice") => {
    const newComponent: FormComponentType = {
      id: Date.now().toString(),
      type,
      label: type === "rating" ? "How would you rate this?" : type === "text" ? "Your feedback" : "Select an option",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/forms">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Form</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
              <CardDescription>Enter the basic details for your form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Form Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Customer Feedback Form"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Form Type</Label>
                <div className="flex items-center space-x-2">
                  <Tabs value={formType} onValueChange={setFormType} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="feedback">Feedback</TabsTrigger>
                      <TabsTrigger value="complaint">Complaint</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>Add and arrange components for your form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => addComponent("rating")}>
                  <Star className="mr-2 h-4 w-4" />
                  Add Rating
                </Button>
                <Button variant="outline" size="sm" onClick={() => addComponent("text")}>
                  <Type className="mr-2 h-4 w-4" />
                  Add Text Field
                </Button>
                <Button variant="outline" size="sm" onClick={() => addComponent("choice")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Multiple Choice
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
                        <Label htmlFor={`label-${component.id}`}>Question</Label>
                        <Input
                          id={`label-${component.id}`}
                          value={component.label}
                          onChange={(e) => updateComponent(component.id, { label: e.target.value })}
                        />
                      </div>

                      {component.type === "choice" && (
                        <div className="space-y-2">
                          <Label>Options</Label>
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
                                const newOptions = [...(component.options || []), "New Option"]
                                updateComponent(component.id, { options: newOptions })
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Option
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
                        <Label htmlFor={`required-${component.id}`}>Required field</Label>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeComponent(component.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/dashboard/forms">Cancel</Link>
              </Button>
              <Button>Save Form</Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="md:sticky md:top-20">
          <CardHeader>
            <CardTitle>Form Preview</CardTitle>
            <CardDescription>Preview how your form will look to customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-6">
              <h2 className="text-xl font-bold">{formName || "Your Form Name"}</h2>
              <p className="text-sm text-muted-foreground">
                {formType === "feedback"
                  ? "We value your feedback! Please let us know about your experience."
                  : "We're sorry you had an issue. Please tell us what went wrong."}
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

                    {component.type === "text" && <Textarea placeholder="Enter your feedback here..." />}

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
                <Button className="w-full">Submit</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

