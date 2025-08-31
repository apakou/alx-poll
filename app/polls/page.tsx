"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Calendar, Users, Vote, Plus, Share2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { SharePoll } from "@/components/share-poll"

interface PollOption {
  id: string
  option_text: string
  option_order: number
  votes_count: number
}

interface Poll {
  id: string
  title: string
  description?: string
  created_by: string
  created_at: string
  expires_at?: string
  is_active: boolean
  is_anonymous: boolean
  allow_multiple_votes: boolean
  category?: string
  total_votes: number
  poll_options: PollOption[]
}

export default function PollsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "closed">("all")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchPolls()
    }
  }, [user])

  const fetchPolls = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/polls')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch polls')
      }

      setPolls(data.polls || [])
    } catch (err) {
      console.error('Error fetching polls:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch polls')
    } finally {
      setLoading(false)
    }
  }

  const filteredPolls = polls.filter(poll => {
    const matchesSearch = poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poll.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "active" && poll.is_active) ||
                         (filterStatus === "closed" && !poll.is_active)
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
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
                <Badge variant={poll.is_active ? "default" : "secondary"}>
                  {poll.is_active ? "Active" : "Closed"}
                </Badge>
                {poll.expires_at && (
                  <span className="text-xs text-muted-foreground">
                    {getDaysRemaining(poll.expires_at)}
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
                {poll.poll_options && poll.poll_options.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{poll.poll_options[0].option_text}</span>
                      <span className="font-medium">
                        {poll.total_votes > 0 
                          ? Math.round((poll.poll_options[0].votes_count / poll.total_votes) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: `${poll.total_votes > 0 
                            ? Math.round((poll.poll_options[0].votes_count / poll.total_votes) * 100)
                            : 0
                          }%` 
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Poll metadata */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{poll.total_votes} votes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(poll.created_at)}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Link href={`/polls/${poll.id}`} className="flex-1">
                    <Button className="w-full" size="sm" disabled={!poll.is_active}>
                      {poll.is_active ? "Vote Now" : "View Results"}
                    </Button>
                  </Link>
                  <SharePoll pollId={poll.id} pollTitle={poll.title} />
                  <Link href={`/polls/${poll.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
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
