"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Calendar, Users, Eye } from "lucide-react"
import type { CreatePollData } from "@/lib/types"

export default function CreatePollPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CreatePollData>({
    title: "",
    description: "",
    options: ["", ""],
    endDate: undefined,
    allowMultipleVotes: false,
    isAnonymous: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInputChange = (field: keyof CreatePollData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }))
  }

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, ""]
      }))
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Validate form
    const validOptions = formData.options.filter(option => option.trim() !== "")
    if (validOptions.length < 2) {
      setError("Please provide at least 2 options")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          options: validOptions
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create poll')
      }

      // Success! Show success message and redirect to polls listing
      setSuccess('Poll created successfully! Redirecting...')
      
      // Wait a bit to show the success message, then redirect
      setTimeout(() => {
        router.push('/polls')
      }, 1500)
    } catch (err) {
      console.error('Error creating poll:', err)
      setError(err instanceof Error ? err.message : 'Failed to create poll')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.title.trim() !== "" && 
                     formData.options.filter(opt => opt.trim() !== "").length >= 2

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Poll</h1>
        <p className="text-gray-600">
          Create an engaging poll to gather opinions and insights from your audience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Poll Details</CardTitle>
              <CardDescription>
                Fill in the basic information for your poll
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 text-sm flex items-center">
                    <span className="mr-2">✓</span>
                    {success}
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Poll Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Poll Title *</Label>
                  <Input
                    id="title"
                    placeholder="What would you like to ask?"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                {/* Poll Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <textarea
                    id="description"
                    placeholder="Provide additional context or details about your poll..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Poll Options */}
                <div className="space-y-4">
                  <Label>Poll Options *</Label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                      />
                      {formData.options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.options.length < 10 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addOption}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>

                {/* Poll Settings */}
                <div className="space-y-4">
                  <Label>Poll Settings</Label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="allowMultipleVotes"
                        checked={formData.allowMultipleVotes}
                        onChange={(e) => handleInputChange("allowMultipleVotes", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="allowMultipleVotes" className="text-sm font-normal">
                        Allow multiple votes per user
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isAnonymous"
                        checked={formData.isAnonymous}
                        onChange={(e) => handleInputChange("isAnonymous", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="isAnonymous" className="text-sm font-normal">
                        Allow anonymous voting
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={formData.endDate ? new Date(formData.endDate.getTime() - formData.endDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                        onChange={(e) => handleInputChange("endDate", e.target.value ? new Date(e.target.value) : undefined)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!isFormValid || isLoading || !!success}
                >
                  {success ? "Poll Created! Redirecting..." : isLoading ? "Creating Poll..." : "Create Poll"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </CardTitle>
              <CardDescription>
                See how your poll will look to voters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {formData.title || "Your poll title will appear here"}
                  </h3>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    option.trim() && (
                      <div key={index} className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                        <span className="text-sm">{option}</span>
                      </div>
                    )
                  ))}
                  {formData.options.filter(opt => opt.trim()).length === 0 && (
                    <div className="p-3 border rounded-lg bg-gray-50 text-muted-foreground text-sm">
                      Your poll options will appear here
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>0 votes</span>
                  </div>
                  {formData.endDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>Ends {new Date(formData.endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex gap-1">
                    {formData.allowMultipleVotes && (
                      <Badge variant="secondary" className="text-xs">Multiple Votes</Badge>
                    )}
                    {formData.isAnonymous && (
                      <Badge variant="secondary" className="text-xs">Anonymous</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
