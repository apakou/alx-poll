"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Plus, X, GripVertical, Save, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  EditPollData, 
  EditPollFormData, 
  EditPollOptionFormData,
  UpdatePollData 
} from "@/lib/types"
import { 
  pollToEditForm, 
  editFormToUpdate, 
  addNewOption, 
  removeOption, 
  reorderOptions, 
  validateEditPollForm 
} from "@/lib/utils/poll-edit"
import { toast } from "sonner"

interface EditPollFormProps {
  poll: EditPollData
  onSave?: (updatedPoll: EditPollData) => void
  onCancel?: () => void
}

export function EditPollForm({ poll, onSave, onCancel }: EditPollFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<EditPollFormData>(() => pollToEditForm(poll))
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors([])

    // Validate form
    const validation = validateEditPollForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      setIsLoading(false)
      return
    }

    try {
      const { pollUpdate, optionUpdates } = editFormToUpdate(formData)

      // Update poll
      const response = await fetch(`/api/polls/${poll.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pollUpdate,
          optionUpdates
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update poll')
      }

      toast.success('Poll updated successfully!')
      onSave?.(data.poll)
      
    } catch (err) {
      console.error('Error updating poll:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update poll'
      setErrors([errorMessage])
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddOption = () => {
    setFormData(addNewOption(formData))
  }

  const handleRemoveOption = (index: number) => {
    setFormData(removeOption(formData, index))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = { ...newOptions[index], option_text: value }
    setFormData({ ...formData, options: newOptions })
  }

  const handleReorderOptions = (fromIndex: number, toIndex: number) => {
    setFormData(reorderOptions(formData, fromIndex, toIndex))
  }

  const activeOptions = formData.options.filter(option => !option._isDeleted)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Poll</h1>
            <p className="text-gray-600 mt-1">Modify your poll settings and options</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={poll.is_active ? "default" : "secondary"}>
              {poll.is_active ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">
              {poll.total_votes} votes
            </Badge>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-800">
              <p className="font-medium mb-2">Please fix the following errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Poll Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter poll title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description for your poll"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Poll category (optional)"
              />
            </div>

            <div>
              <Label htmlFor="expires_at">Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expires_at && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expires_at ? (
                      format(formData.expires_at, "PPP")
                    ) : (
                      <span>No expiry date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expires_at || undefined}
                    onSelect={(date) => setFormData({ ...formData, expires_at: date || null })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                  {formData.expires_at && (
                    <div className="p-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, expires_at: null })}
                        className="w-full"
                      >
                        Clear date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Poll Options */}
        <Card>
          <CardHeader>
            <CardTitle>Poll Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeOptions.map((option, index) => (
              <div key={option.id || `new-${index}`} className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <Input
                    value={option.option_text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
                {!option._isNew && (
                  <Badge variant="outline" className="text-xs">
                    {option.id ? 'Existing' : 'New'}
                  </Badge>
                )}
                {activeOptions.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Poll Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Poll Active</Label>
                <p className="text-sm text-gray-600">Enable voting on this poll</p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow_multiple_votes">Allow Multiple Votes</Label>
                <p className="text-sm text-gray-600">Users can select multiple options</p>
              </div>
              <Switch
                id="allow_multiple_votes"
                checked={formData.allow_multiple_votes}
                onCheckedChange={(checked) => setFormData({ ...formData, allow_multiple_votes: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_anonymous">Anonymous Voting</Label>
                <p className="text-sm text-gray-600">Hide voter identities</p>
              </div>
              <Switch
                id="is_anonymous"
                checked={formData.is_anonymous}
                onCheckedChange={(checked) => setFormData({ ...formData, is_anonymous: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => router.back())}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}