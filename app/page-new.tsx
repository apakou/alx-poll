import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Vote } from "lucide-react"

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-10">
      <Vote className="h-16 w-16 text-blue-600 mb-8" />
      <h1 className="text-4xl font-bold text-center mb-4">
        Create and Share Polls Easily
      </h1>
      <p className="text-xl text-muted-foreground text-center max-w-2xl mb-8">
        Make better decisions with quick feedback from your team, community, or audience.
      </p>
      <div className="flex gap-4">
        <Link href="/polls/create">
          <Button size="lg">
            Create a Poll
          </Button>
        </Link>
        <Link href="/polls">
          <Button variant="outline" size="lg">
            Browse Polls
          </Button>
        </Link>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Easy to Create</h3>
          <p className="text-muted-foreground">
            Set up your poll in minutes with our simple interface.
          </p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Real-time Results</h3>
          <p className="text-muted-foreground">
            Watch votes come in and analyze results instantly.
          </p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Share Anywhere</h3>
          <p className="text-muted-foreground">
            Share your polls with a simple link or embed them.
          </p>
        </div>
      </div>
    </div>
  )
}
