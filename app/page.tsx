import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Vote, BarChart3, Users, Zap, Shield, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            ✨ Create polls in seconds
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Create Amazing Polls
            <span className="text-primary block">Gather Valuable Insights</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Build engaging polls, collect responses, and analyze results with our modern, 
            easy-to-use polling platform. Perfect for teams, communities, and decision-making.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/polls/create">
              <Button size="lg" className="text-lg px-8 py-4">
                <Vote className="mr-2 h-5 w-5" />
                Create Your First Poll
              </Button>
            </Link>
            <Link href="/polls">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Browse Polls
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need for effective polling
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need to create, share, and analyze polls effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Quick & Easy</CardTitle>
                <CardDescription>
                  Create beautiful polls in minutes with our intuitive drag-and-drop interface.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Real-time Results</CardTitle>
                <CardDescription>
                  Watch responses come in live and get instant insights with beautiful charts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Engage Your Audience</CardTitle>
                <CardDescription>
                  Share polls easily and boost participation with anonymous voting options.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your data is protected with enterprise-grade security and privacy controls.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Time Controls</CardTitle>
                <CardDescription>
                  Set start and end dates, or let polls run indefinitely based on your needs.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Vote className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Multiple Options</CardTitle>
                <CardDescription>
                  Support for multiple choice, single selection, and anonymous voting.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Trusted by thousands of users
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-lg text-gray-600">Polls Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-lg text-gray-600">Votes Cast</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99%</div>
              <div className="text-lg text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust ALX Poll for their decision-making needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Get Started Free
              </Button>
            </Link>
            <Link href="/polls">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 text-white border-white hover:bg-white hover:text-primary">
                Explore Polls
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
