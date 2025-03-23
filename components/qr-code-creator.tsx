"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export function QrCodeCreator() {
  const [qrName, setQrName] = useState("")
  const [location, setLocation] = useState("")
  const [color, setColor] = useState("#3b82f6")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [size, setSize] = useState(200)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/qr-codes">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create QR Code</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>QR Code Details</CardTitle>
            <CardDescription>Enter the details for your new QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">QR Code Name</Label>
              <Input
                id="name"
                placeholder="e.g. Restaurant Table Cards"
                value={qrName}
                onChange={(e) => setQrName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Street Branch</SelectItem>
                  <SelectItem value="downtown">Downtown Location</SelectItem>
                  <SelectItem value="westside">Westside Store</SelectItem>
                  <SelectItem value="airport">Airport Kiosk</SelectItem>
                  <SelectItem value="all">All Locations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="design">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="form">Form</TabsTrigger>
              </TabsList>
              <TabsContent value="design" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="color">QR Code Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-10 cursor-pointer p-1"
                    />
                    <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bg-color">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-10 w-10 cursor-pointer p-1"
                    />
                    <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="size">Size</Label>
                    <span className="text-sm text-muted-foreground">{size}px</span>
                  </div>
                  <Slider
                    id="size"
                    min={100}
                    max={400}
                    step={10}
                    value={[size]}
                    onValueChange={(value) => setSize(value[0])}
                  />
                </div>
              </TabsContent>
              <TabsContent value="form" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="form">Select Form</Label>
                  <Select>
                    <SelectTrigger id="form">
                      <SelectValue placeholder="Select a form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Feedback</SelectItem>
                      <SelectItem value="restaurant">Restaurant Experience</SelectItem>
                      <SelectItem value="service">Service Quality</SelectItem>
                      <SelectItem value="product">Product Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-md border p-4">
                  <h3 className="font-medium">Form Preview</h3>
                  <p className="text-sm text-muted-foreground">Select a form to see a preview</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/dashboard/qr-codes">Cancel</Link>
            </Button>
            <Button>Create QR Code</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR Code Preview</CardTitle>
            <CardDescription>Preview how your QR code will look</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div
              className="flex items-center justify-center rounded-md border p-6"
              style={{ backgroundColor: bgColor }}
            >
              <div className="flex h-48 w-48 items-center justify-center rounded-md">
                <QrCode className="h-full w-full" style={{ color: color }} />
              </div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="font-medium">{qrName || "QR Code Name"}</h3>
              <p className="text-sm text-muted-foreground">
                {location
                  ? {
                      main: "Main Street Branch",
                      downtown: "Downtown Location",
                      westside: "Westside Store",
                      airport: "Airport Kiosk",
                      all: "All Locations",
                    }[location]
                  : "Location"}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled={!qrName || !location}>
              <Download className="mr-2 h-4 w-4" />
              Download Preview
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

