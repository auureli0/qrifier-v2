"use client"

import { useState } from "react"
import { CheckCircle2, Clock, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const feedbackData = [
  {
    id: "1",
    date: "2023-03-21T14:30:00",
    location: "Main Street Branch",
    comment: "The service was excellent, very friendly staff!",
    status: "processed",
    type: "feedback",
  },
  {
    id: "2",
    date: "2023-03-21T12:15:00",
    location: "Downtown Location",
    comment: "Had to wait too long for my order. Please improve your service.",
    status: "pending",
    type: "complaint",
  },
  {
    id: "3",
    date: "2023-03-21T10:45:00",
    location: "Westside Store",
    comment: "Great atmosphere and clean facilities.",
    status: "processed",
    type: "feedback",
  },
  {
    id: "4",
    date: "2023-03-20T16:20:00",
    location: "Airport Kiosk",
    comment: "The product I received was damaged. I'd like a replacement.",
    status: "pending",
    type: "complaint",
  },
  {
    id: "5",
    date: "2023-03-20T09:10:00",
    location: "Main Street Branch",
    comment: "Your staff was very helpful with my questions.",
    status: "processed",
    type: "feedback",
  },
]

export function FeedbackTable() {
  const [feedback, setFeedback] = useState(feedbackData)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const markAsProcessed = (id: string) => {
    setFeedback(feedback.map((item) => (item.id === id ? { ...item, status: "processed" } : item)))
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="hidden md:table-cell">Feedback</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {feedback.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{formatDate(item.date)}</TableCell>
            <TableCell>{item.location}</TableCell>
            <TableCell className="hidden max-w-[300px] truncate md:table-cell">{item.comment}</TableCell>
            <TableCell>
              <Badge variant={item.type === "complaint" ? "destructive" : "secondary"}>
                {item.type === "complaint" ? "Complaint" : "Feedback"}
              </Badge>
            </TableCell>
            <TableCell>
              {item.status === "processed" ? (
                <Badge variant="outline" className="flex w-fit items-center gap-1 text-green-500">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Processed</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="flex w-fit items-center gap-1 text-amber-500">
                  <Clock className="h-3 w-3" />
                  <span>Pending</span>
                </Badge>
              )}
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
                  <DropdownMenuItem onClick={() => markAsProcessed(item.id)}>Mark as processed</DropdownMenuItem>
                  <DropdownMenuItem>View details</DropdownMenuItem>
                  <DropdownMenuItem>Reply</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

