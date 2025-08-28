"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BarChart3, Users, Vote, Plus, TrendingUp, Calendar, Clock, Eye, MessageCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Mock data for demonstration
const mockStats = {
  totalPolls: 12,
  totalVotes: 248,
  activePolls: 5,
  responseRate: "78%"
}

const mockRecentPolls = [
  {
    id: "1",
    title: "Favorite Programming Language",
    description: "Help us understand the most popular programming languages in our community",
    votes: 45,
    status: "active",
    createdAt: "2 days ago",
    expiresAt: "5 days left",
    category: "Technology"
  },
  {
    id: "2", 
    title: "Best Time for Team Meetings",
    description: "Let's find the optimal time for our weekly team sync meetings",
    votes: 23,
    status: "closed",
    createdAt: "1 week ago",
    expiresAt: "Closed",
    category: "Work"
  },
  {
    id: "3",
    title: "Office Lunch Preferences",
    description: "What type of food should we order for our monthly office lunch?",
    votes: 67,
    status: "active",
    createdAt: "3 days ago",
    expiresAt: "2 days left",
    category: "Food"
  }
]

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

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
                  <p className="text-3xl font-bold text-blue-900 mt-1">{mockStats.totalPolls}</p>
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
                  <p className="text-3xl font-bold text-green-900 mt-1">{mockStats.totalVotes}</p>
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
                  <p className="text-3xl font-bold text-purple-900 mt-1">{mockStats.activePolls}</p>
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
                  <p className="text-3xl font-bold text-amber-900 mt-1">{mockStats.responseRate}</p>
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
                {mockRecentPolls.map((poll) => (
                  <div key={poll.id} className="group">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200/50 hover:shadow-md hover:border-blue-200 transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {poll.title}
                            </h3>
                            <Badge 
                              variant={poll.status === "active" ? "default" : "secondary"}
                              className={`text-xs px-2 py-1 ${
                                poll.status === "active" 
                                  ? "bg-green-100 text-green-700 border-green-200" 
                                  : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                            >
                              {poll.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {poll.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {poll.createdAt}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {poll.expiresAt}
                            </span>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                              {poll.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                            <p className="text-lg font-bold text-gray-900">{poll.votes}</p>
                            <p className="text-xs text-gray-500">votes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
