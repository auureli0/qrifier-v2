"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, ChevronRight, Clock, FormInput, QrCode, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeedbackTable } from "@/components/feedback-table"
import { FeedbackChart } from "@/components/feedback-chart"

export function DashboardContent() {
  const [timeframe, setTimeframe] = useState("today")

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Willkommen zurück! Hier ist ein Überblick Ihrer Feedback-Daten.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/forms/new">
              <FormInput className="mr-2 h-4 w-4" />
              Neues Formular
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/qr-codes/new">
              <QrCode className="mr-2 h-4 w-4" />
              Neuer QR-Code
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gesamtes Feedback</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.248</div>
            <p className="text-xs text-muted-foreground">+12,5% im Vergleich zum Vormonat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Feedback heute</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+4 im Vergleich zu gestern</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reaktionszeit</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14 Min</div>
            <p className="text-xs text-muted-foreground">-2 Min im Vergleich zur Vorwoche</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback-Übersicht</CardTitle>
          <CardDescription>Verfolgen Sie Feedback-Trends im Zeitverlauf</CardDescription>
          <Tabs defaultValue="today" className="mt-2" value={timeframe} onValueChange={setTimeframe}>
            <TabsList>
              <TabsTrigger value="today">Heute</TabsTrigger>
              <TabsTrigger value="week">Diese Woche</TabsTrigger>
              <TabsTrigger value="month">Dieser Monat</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <FeedbackChart timeframe={timeframe} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Neuestes Feedback</CardTitle>
            <CardDescription>Das neueste Feedback Ihrer Kunden</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/feedback">
              Alle ansehen
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <FeedbackTable />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top-Standorte</CardTitle>
            <CardDescription>Standorte mit dem meisten Feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Hauptstraße Filiale", count: 423, percentage: 85 },
                { name: "Innenstadt Standort", count: 356, percentage: 72 },
                { name: "Westseite Geschäft", count: 289, percentage: 58 },
                { name: "Flughafen Kiosk", count: 180, percentage: 36 },
              ].map((location) => (
                <div key={location.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{location.name}</div>
                    <div className="text-sm text-muted-foreground">{location.count}</div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${location.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>QR-Code Leistung</CardTitle>
            <CardDescription>Am häufigsten gescannte QR-Codes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Restaurant Tischkarten", scans: 856, percentage: 92 },
                { name: "Kassenbon QR-Code", scans: 753, percentage: 81 },
                { name: "Eingangsbereich Display", scans: 642, percentage: 69 },
                { name: "Kassatheke", scans: 534, percentage: 57 },
              ].map((qrCode) => (
                <div key={qrCode.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{qrCode.name}</div>
                    <div className="text-sm text-muted-foreground">{qrCode.scans} Scans</div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${qrCode.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/dashboard/qr-codes">
                <QrCode className="mr-2 h-4 w-4" />
                QR-Codes verwalten
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

