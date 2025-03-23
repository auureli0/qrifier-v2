"use client"

import Link from "next/link"
import { Download, Edit, Eye, Plus, QrCode, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const qrCodes = [
  {
    id: "1",
    name: "Restaurant Table Cards",
    location: "Main Street Branch",
    scans: 856,
    created: "2023-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "Receipt QR Code",
    location: "All Locations",
    scans: 753,
    created: "2023-01-20",
    status: "active",
  },
  {
    id: "3",
    name: "Entrance Display",
    location: "Downtown Location",
    scans: 642,
    created: "2023-02-05",
    status: "active",
  },
  {
    id: "4",
    name: "Checkout Counter",
    location: "Westside Store",
    scans: 534,
    created: "2023-02-10",
    status: "active",
  },
  {
    id: "5",
    name: "Promotional Flyer",
    location: "All Locations",
    scans: 423,
    created: "2023-02-15",
    status: "inactive",
  },
]

export function QrCodesContent() {
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
          <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
          <p className="text-muted-foreground">Manage and create QR codes for your feedback forms</p>
        </div>
        <Button asChild>
          <Link href="/qr-codes/new">
            <Plus className="mr-2 h-4 w-4" />
            Create QR Code
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your QR Codes</CardTitle>
          <CardDescription>View and manage all your QR codes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>QR Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
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
                      <QrCode className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{qrCode.name}</TableCell>
                  <TableCell>{qrCode.location}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(qrCode.created)}</TableCell>
                  <TableCell>{qrCode.scans.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={qrCode.status === "active" ? "default" : "secondary"}>
                      {qrCode.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
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

