"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Vote, BarChart3, Plus, User, LogIn, LogOut, Menu } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export default function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut, loading } = useAuth()

  const navItems = [
    {
      href: "/polls",
      label: "Browse Polls",
      icon: Vote,
    },
    {
      href: "/dashboard",
      label: "Dashboard", 
      icon: BarChart3,
      protected: true,
    },
    {
      href: "/polls/create",
      label: "Create Poll",
      icon: Plus,
      protected: true,
    },
  ]

  const handleSignOut = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Vote className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">ALX Poll</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isProtected = item.protected
              
              // Hide protected routes if user is not authenticated
              if (isProtected && !user) {
                return null
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105",
                    pathname === item.href
                      ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border border-blue-200/50 shadow-sm"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-transparent hover:border-gray-200/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700 bg-gray-50 px-3 py-1 rounded-full border">
                  Welcome, <span className="font-medium text-gray-900">{user.email}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 py-4 bg-white/95 backdrop-blur-sm">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isProtected = item.protected
                
                // Hide protected routes if user is not authenticated
                if (isProtected && !user) {
                  return null
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      pathname === item.href
                        ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border border-blue-200/50"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <div className="border-t border-gray-200/50 pt-4 mt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="px-4 py-2 text-sm bg-gray-50 rounded-lg border">
                      Welcome, <span className="font-medium text-gray-900">{user.email}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button 
                        size="sm" 
                        className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
