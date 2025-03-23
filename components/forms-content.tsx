"use client"

import Link from "next/link"
import { Copy, Edit, FormInput, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const forms = [
  {
    id: "1",
    name: "General Feedback",
    type: "feedback",
    responses: 423,
    created: "2023-01-10",
    status: "active",
  },
  {
    id: "2",
    name: "Restaurant Experience",
    type: "feedback",
    responses: 356,
    created: "2023-01-15",
    status: "active",
  },
  {
    id: "3",
    name: "Service Complaint",
    type: "complaint",
    responses: 189,
    created: "2023-02-01",
    status: "active",
  },
  {
    id: "4",
    name: "Product Feedback",
    type: "feedback",
    responses: 267,
    created: "2023-02-10",
    status: "active",
  },
  {
    id: "5",
    name: "Delivery Issues",
    type: "complaint",
    responses: 142,
    created: "2023-02-20",
    status: "inactive",
  },
]

export function FormsContent() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground">Create and manage your feedback forms</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/forms/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Form
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Forms</CardTitle>
          <CardDescription>View and manage all your feedback forms</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead>Responses</TableHead>
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
                      {form.type === "complaint" ? "Complaint" : "Feedback"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(form.created)}</TableCell>
                  <TableCell>{form.responses.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={form.status === "active" ? "default" : "secondary"}>
                      {form.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/forms/${form.id}`}>
                            <FormInput className="mr-2 h-4 w-4" />
                            View Form
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/forms/${form.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Form
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

