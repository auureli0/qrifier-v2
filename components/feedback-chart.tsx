"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"

// Generate sample data based on timeframe
const generateData = (timeframe: string) => {
  if (timeframe === "today") {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      feedback: Math.floor(Math.random() * 10),
      complaints: Math.floor(Math.random() * 5),
    }))
  } else if (timeframe === "week") {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return days.map((day) => ({
      time: day,
      feedback: Math.floor(Math.random() * 50) + 10,
      complaints: Math.floor(Math.random() * 20) + 5,
    }))
  } else {
    // month
    return Array.from({ length: 30 }, (_, i) => ({
      time: `${i + 1}`,
      feedback: Math.floor(Math.random() * 100) + 20,
      complaints: Math.floor(Math.random() * 40) + 10,
    }))
  }
}

interface FeedbackChartProps {
  timeframe: string
}

export function FeedbackChart({ timeframe }: FeedbackChartProps) {
  const data = generateData(timeframe)

  const chartConfig = {
    feedback: {
      label: "Feedback",
      color: "#3b82f6"
    },
    complaints: {
      label: "Complaints",
      color: "#ef4444"
    }
  } satisfies ChartConfig

  return (
    <div className="h-[300px] w-full">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorFeedback" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            tickMargin={10}
            tickFormatter={(value: string) => {
              if (timeframe === "today") {
                return value.split(":")[0]
              }
              return value
            }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="feedback"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorFeedback)"
            name="Feedback"
          />
          <Area
            type="monotone"
            dataKey="complaints"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorComplaints)"
            name="Complaints"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

