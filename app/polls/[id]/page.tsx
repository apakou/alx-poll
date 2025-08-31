"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Users, Vote, Share2, Eye, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { SharePoll } from "@/components/share-poll"
import { toast } from "sonner"

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

interface PollPageProps {
  params: {
    id: string
  }
}

export default function PollPage({ params }: PollPageProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchPoll()
    }
  }, [user, authLoading, params.id])

  const fetchPoll = async () => {
    try {
      const response = await fetch(`/api/polls/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch poll')
      }

      setPoll(data.poll)
      setHasVoted(data.hasVoted || false)
    } catch (err) {
      console.error('Error fetching poll:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch poll')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (optionId: string) => {
    if (!poll) return

    if (poll.allow_multiple_votes) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      )
    } else {
      setSelectedOptions([optionId])
    }
  }

  const handleVote = async () => {
    if (!poll || selectedOptions.length === 0 || !user) return

    setVoting(true)
    try {
      const response = await fetch(`/api/polls/${params.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optionIds: selectedOptions
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote')
      }

      // Update poll data with new vote counts
      setPoll(data.poll)
      setHasVoted(true)
      setSelectedOptions([])
      toast.success("Vote submitted successfully!")
    } catch (err) {
      console.error('Error voting:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setVoting(false)
    }
  }

  const calculatePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = poll?.expires_at ? new Date(poll.expires_at) < new Date() : false
  const canVote = poll?.is_active && !isExpired && !hasVoted

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading poll...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Poll not found</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                ← Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <SharePoll pollId={poll.id} pollTitle={poll.title} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Poll */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {poll.category && (
                        <Badge variant="secondary">{poll.category}</Badge>
                      )}
                      <Badge variant={poll.is_active ? "default" : "secondary"}>
                        {poll.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {isExpired && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-gray-900">{poll.title}</CardTitle>
                  {poll.description && (
                    <CardDescription className="text-base text-gray-600">
                      {poll.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {/* Debug info - remove in production */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                      <div>canVote: {canVote ? 'true' : 'false'}</div>
                      <div>hasVoted: {hasVoted ? 'true' : 'false'}</div>
                      <div>isActive: {poll?.is_active ? 'true' : 'false'}</div>
                      <div>isExpired: {isExpired ? 'true' : 'false'}</div>
                      <div>selectedOptions: {selectedOptions.length}</div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {poll.poll_options
                      .sort((a, b) => a.option_order - b.option_order)
                      .map((option) => {
                        const percentage = calculatePercentage(option.votes_count, poll.total_votes)
                        const isSelected = selectedOptions.includes(option.id)

                        return (
                          <div key={option.id} className="space-y-2">
                            <div
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                canVote
                                  ? isSelected
                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                  : "border-gray-200 bg-gray-50 cursor-default"
                              }`}
                              onClick={() => canVote && handleOptionSelect(option.id)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  {canVote && (
                                    <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                                      isSelected 
                                        ? "bg-blue-500 border-blue-500" 
                                        : "border-gray-300"
                                    }`}>
                                      {isSelected && (
                                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                      )}
                                    </div>
                                  )}
                                  <span className="font-medium text-gray-900">{option.option_text}</span>
                                </div>
                                <span className="text-sm text-gray-600">
                                  {option.votes_count} votes ({percentage}%)
                                </span>
                              </div>
                              {(hasVoted || !canVote) && (
                                <Progress value={percentage} className="h-2" />
                              )}
                            </div>
                          </div>
                        )
                      })}

                    {canVote && (
                      <div className="pt-4">
                        <Button 
                          onClick={handleVote} 
                          disabled={voting || selectedOptions.length === 0}
                          className="w-full"
                          size="lg"
                        >
                          {voting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Submitting Vote...
                            </>
                          ) : (
                            <>
                              <Vote className="h-4 w-4 mr-2" />
                              {selectedOptions.length === 0 ? "Select an option to vote" : "Submit Vote"}
                            </>
                          )}
                        </Button>
                        {poll.allow_multiple_votes && (
                          <p className="text-sm text-gray-600 mt-2 text-center">
                            You can select multiple options
                          </p>
                        )}
                        {selectedOptions.length === 0 && (
                          <p className="text-sm text-gray-500 mt-2 text-center">
                            Choose one or more options above to cast your vote
                          </p>
                        )}
                      </div>
                    )}

                    {hasVoted && (
                      <div className="pt-4 text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
                          <Vote className="h-4 w-4 mr-2" />
                          <span className="font-medium">Thank you for voting!</span>
                        </div>
                      </div>
                    )}

                    {!canVote && !hasVoted && (
                      <div className="pt-4 text-center">
                        <p className="text-gray-600">
                          {isExpired ? "This poll has expired" : "This poll is not active"}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Poll Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Poll Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Vote className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Total Votes</span>
                    </div>
                    <span className="font-semibold text-gray-900">{poll.total_votes}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Options</span>
                    </div>
                    <span className="font-semibold text-gray-900">{poll.poll_options.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Type</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {poll.is_anonymous ? "Anonymous" : "Public"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">Created</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDate(poll.created_at)}
                    </span>
                  </div>

                  {poll.expires_at && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-gray-700">Expires</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatDate(poll.expires_at)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
