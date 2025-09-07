"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BarChart3, Users, Vote, Plus, TrendingUp, Calendar, Clock, Eye, MessageCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

/**
 * Poll Option Interface
 * 
 * Represents a single option within a poll with vote tracking.
 */
interface PollOption {
  /** Unique identifier for the poll option */
  id: string
  /** Display text for the option */
  option_text: string
  /** Display order (1, 2, 3, etc.) */
  option_order: number
  /** Current number of votes for this option */
  votes_count: number
}

/**
 * Poll Interface
 * 
 * Complete poll data structure with metadata and nested options.
 */
interface Poll {
  /** Unique identifier for the poll */
  id: string
  /** Poll title/question */
  title: string
  /** Optional poll description */
  description?: string
  /** User ID of poll creator */
  created_by: string
  /** ISO timestamp of poll creation */
  created_at: string
  /** Optional ISO timestamp of poll expiration */
  expires_at?: string
  /** Whether poll accepts new votes */
  is_active: boolean
  /** Whether votes are anonymous */
  is_anonymous: boolean
  /** Whether users can select multiple options */
  allow_multiple_votes: boolean
  /** Optional poll category for organization */
  category?: string
  /** Total vote count across all options */
  total_votes: number
  /** Array of poll options with vote counts */
  poll_options: PollOption[]
}

/**
 * Dashboard Page Component
 * 
 * Main dashboard interface for poll creators and users. Provides an overview
 * of user's polls, voting statistics, and quick actions for poll management.
 * 
 * Features:
 * - Real-time poll statistics (total polls, votes, active polls)
 * - Recent polls list with status indicators
 * - Quick action buttons for poll creation and management
 * - Responsive grid layout with animated stat cards
 * - Error handling with retry functionality
 * - Protected route with authentication checks
 * 
 * Data flow:
 * 1. Authentication check - redirect to login if not authenticated
 * 2. Fetch user's polls from API with error handling
 * 3. Calculate statistics from poll data
 * 4. Display stats cards and recent polls list
 * 5. Provide navigation to poll details and creation
 * 
 * @returns JSX.Element - Fully functional dashboard page
 */
export default function DashboardPage() {
  // Authentication and navigation
  const { user, loading } = useAuth()
  const router = useRouter()
  
  // Poll data state management
  const [polls, setPolls] = useState<Poll[]>([])
  const [stats, setStats] = useState({
    totalPolls: 0,
    totalVotes: 0,
    activePolls: 0,
    responseRate: "0%"
  })
  
  // UI state management
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Authentication Guard Effect
   * 
   * Redirects unauthenticated users to login page.
   * Runs after initial auth check completes.
   */
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  /**
   * Data Fetching Effect
   * 
   * Fetches user's polls when authentication is confirmed.
   * Triggers poll data loading and statistics calculation.
   */
  useEffect(() => {
    if (user) {
      fetchPolls()
    }
  }, [user])

  /**
   * Poll Data Fetcher
   * 
   * Fetches user's polls from API and calculates dashboard statistics.
   * Handles loading states, error scenarios, and data transformation.
   * 
   * Statistics calculated:
   * - Total polls created by user
   * - Total votes received across all polls
   * - Number of currently active polls
   * - Average response rate (votes per poll)
   */
  const fetchPolls = async () => {
    try {
      setLoadingData(true)
      const response = await fetch('/api/polls?created_by=' + user?.id)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch polls')
      }

      const userPolls = data.polls || []
      setPolls(userPolls)

      // Calculate dashboard statistics
      const totalPolls = userPolls.length
      const totalVotes = userPolls.reduce((sum: number, poll: Poll) => sum + poll.total_votes, 0)
      const activePolls = userPolls.filter((poll: Poll) => poll.is_active).length
      const responseRate = totalPolls > 0 ? Math.round((totalVotes / totalPolls) * 100) / 10 : 0

      setStats({
        totalPolls,
        totalVotes,
        activePolls,
        responseRate: `${responseRate}%`
      })
    } catch (err) {
      console.error('Error fetching polls:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch polls')
    } finally {
      setLoadingData(false)
    }
  }

  /**
   * Date Formatter Utility
   * 
   * Converts ISO date strings to user-friendly format.
   * 
   * @param dateString - ISO date string from database
   * @returns Formatted date string (e.g., "Dec 25")
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Time Remaining Calculator
   * 
   * Calculates and formats remaining time until poll expiration.
   * Provides human-readable time indicators for poll status.
   * 
   * @param expiresAt - Optional ISO expiration timestamp
   * @returns Human-readable time remaining or "No expiration"
   */
  const getTimeLeft = (expiresAt?: string) => {
    if (!expiresAt) return "No expiration"
    
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return "Expired"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days > 0) return `${days} days left`
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours > 0) return `${hours} hours left`
    
    const minutes = Math.floor(diff / (1000 * 60))
    return `${minutes} minutes left`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl transform rotate-1"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
                    Dashboard
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl">
                    Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}! 
                    <span className="block mt-1 text-base">Monitor your polls, track engagement, and discover insights from your community.</span>
                  </p>
                </div>
                <div className="hidden md:block">
                  <Link href="/polls/create">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Plus className="mr-2 h-5 w-5" />
                      Create Poll
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium uppercase tracking-wide">Total Polls</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalPolls}</p>
                </div>
                <div className="bg-blue-200/50 p-3 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-blue-200/30 rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium uppercase tracking-wide">Total Votes</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{stats.totalVotes}</p>
                </div>
                <div className="bg-green-200/50 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-green-200/30 rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium uppercase tracking-wide">Active Polls</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">{stats.activePolls}</p>
                </div>
                <div className="bg-purple-200/50 p-3 rounded-full">
                  <Vote className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-purple-200/30 rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium uppercase tracking-wide">Response Rate</p>
                  <p className="text-3xl font-bold text-amber-900 mt-1">{stats.responseRate}</p>
                </div>
                <div className="bg-amber-200/50 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-amber-200/30 rounded-full"></div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Polls */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    <MessageCircle className="mr-3 h-5 w-5 text-blue-600" />
                    Recent Polls
                  </CardTitle>
                  <Link href="/polls">
                    <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300 transition-colors">
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </Link>
                </div>
                <CardDescription className="text-gray-600">
                  Your latest polling activities and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <p className="text-gray-600 ml-2">Loading polls...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchPolls}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : polls.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
                      <Vote className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No polls yet</h3>
                      <p className="text-gray-600 mb-4">Create your first poll to get started!</p>
                      <Link href="/polls/create">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Poll
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  polls.slice(0, 5).map((poll) => (
                    <Link key={poll.id} href={`/polls/${poll.id}`}>
                      <div className="group cursor-pointer">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200/50 hover:shadow-md hover:border-blue-200 transition-all duration-300">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {poll.title}
                                </h3>
                                <Badge 
                                  variant={poll.is_active ? "default" : "secondary"}
                                  className={`text-xs px-2 py-1 ${
                                    poll.is_active 
                                      ? "bg-green-100 text-green-700 border-green-200" 
                                      : "bg-gray-100 text-gray-600 border-gray-200"
                                  }`}
                                >
                                  {poll.is_active ? "active" : "inactive"}
                                </Badge>
                              </div>
                              {poll.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {poll.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(poll.created_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {getTimeLeft(poll.expires_at)}
                                </span>
                                {poll.category && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                                    {poll.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                                <p className="text-lg font-bold text-gray-900">{poll.total_votes}</p>
                                <p className="text-xs text-gray-500">votes</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                  <Plus className="mr-2 h-5 w-5 text-purple-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Get started with your next poll
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/polls/create">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" size="lg">
                    <Plus className="mr-3 h-5 w-5" />
                    Create New Poll
                  </Button>
                </Link>
                <Link href="/polls">
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" variant="default" size="lg">
                    <Vote className="mr-3 h-5 w-5" />
                    Browse All Polls
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button className="w-full justify-start bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" variant="default" size="lg">
                    <BarChart3 className="mr-3 h-5 w-5" />
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-indigo-900 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-indigo-600" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                    <p className="text-sm text-indigo-800 font-medium mb-1">📊 Boost Engagement</p>
                    <p className="text-xs text-indigo-600">Add images and clear descriptions to your polls</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                    <p className="text-sm text-indigo-800 font-medium mb-1">⏰ Timing Matters</p>
                    <p className="text-xs text-indigo-600">Share polls when your audience is most active</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                    <p className="text-sm text-indigo-800 font-medium mb-1">🎯 Keep it Simple</p>
                    <p className="text-xs text-indigo-600">Use clear, concise questions for better responses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
