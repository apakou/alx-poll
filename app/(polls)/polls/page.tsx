"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Calendar, Users } from "lucide-react"
import Link from "next/link"
import type { Poll } from "@/lib/types"

// Mock polls data
const mockPolls: Poll[] = [
  {
    id: "1",
    title: "What's your favorite programming language?",
    description: "Help us understand the most popular programming languages in our community.",
    options: [
      { id: "1", text: "JavaScript", votes: 45, percentage: 35 },
      { id: "2", text: "Python", votes: 38, percentage: 30 },
      { id: "3", text: "TypeScript", votes: 25, percentage: 20 },
      { id: "4", text: "Go", votes: 19, percentage: 15 }
    ],
    createdBy: "user1",
    createdAt: new Date("2024-01-20"),
    endDate: new Date("2024-02-20"),
    isActive: true,
    allowMultipleVotes: false,
    isAnonymous: true,
    totalVotes: 127
  },
  {
    id: "2",
    title: "Best time for team meetings?",
    description: "Let's find the optimal time slot that works for everyone.",
    options: [
      { id: "1", text: "9:00 AM", votes: 23, percentage: 40 },
      { id: "2", text: "2:00 PM", votes: 20, percentage: 35 },
      { id: "3", text: "4:00 PM", votes: 14, percentage: 25 }
    ],
    createdBy: "user2", 
    createdAt: new Date("2024-01-18"),
    endDate: new Date("2024-01-25"),
    isActive: false,
    allowMultipleVotes: false,
    isAnonymous: false,
    totalVotes: 57
  },
  {
    id: "3",
    title: "Office lunch preferences",
    description: "Help us choose the catering for next week's team lunch.",
    options: [
      { id: "1", text: "Italian", votes: 34, percentage: 45 },
      { id: "2", text: "Mexican", votes: 26, percentage: 35 },
      { id: "3", text: "Asian", votes: 15, percentage: 20 }
    ],
    createdBy: "user3",
    createdAt: new Date("2024-01-15"),
    isActive: true,
    allowMultipleVotes: true,
    isAnonymous: true,
    totalVotes: 75
  }
]

export default function PollsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "closed">("all")

  const filteredPolls = mockPolls.filter(poll => {
    const matchesSearch = poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poll.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "active" && poll.isActive) ||
                         (filterStatus === "closed" && !poll.isActive)
    return matchesSearch && matchesFilter
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getDaysRemaining = (endDate?: Date) => {
    if (!endDate) return null
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return "Ended"
    if (days === 0) return "Ends today"
    if (days === 1) return "1 day left"
    return `${days} days left`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Polls</h1>
        <p className="text-gray-600">
          Discover and participate in active polls from the community.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search polls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            onClick={() => setFilterStatus("active")}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={filterStatus === "closed" ? "default" : "outline"}
            onClick={() => setFilterStatus("closed")}
            size="sm"
          >
            Closed
          </Button>
        </div>
      </div>

      {/* Polls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPolls.map((poll) => (
          <Card key={poll.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant={poll.isActive ? "default" : "secondary"}>
                  {poll.isActive ? "Active" : "Closed"}
                </Badge>
                {poll.endDate && (
                  <span className="text-xs text-muted-foreground">
                    {getDaysRemaining(poll.endDate)}
                  </span>
                )}
              </div>
              <CardTitle className="text-lg">{poll.title}</CardTitle>
              {poll.description && (
                <CardDescription>{poll.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Top option preview */}
                {poll.options.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{poll.options[0].text}</span>
                      <span className="font-medium">{poll.options[0].percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${poll.options[0].percentage}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Poll metadata */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{poll.totalVotes} votes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(poll.createdAt)}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm" disabled={!poll.isActive}>
                    {poll.isActive ? "Vote Now" : "View Results"}
                  </Button>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredPolls.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== "all" 
              ? "No polls match your search criteria." 
              : "No polls available at the moment."
            }
          </div>
          <Link href="/polls/create">
            <Button>Create Your First Poll</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
