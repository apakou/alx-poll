"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { BarChart, Vote, Plus, LogIn, LogOut } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <Vote className="h-6 w-6" />
          <span className="font-bold">ALX Poll</span>
        </Link>

        <div className="mx-6 flex items-center space-x-4">
          <Link
            href="/dashboard"
            className={pathname === "/dashboard" ? "text-blue-600" : ""}
          >
            <Button variant="ghost" size="sm">
              <BarChart className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link
            href="/polls/create"
            className={pathname === "/polls/create" ? "text-blue-600" : ""}
          >
            <Button variant="ghost" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Poll
            </Button>
          </Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
