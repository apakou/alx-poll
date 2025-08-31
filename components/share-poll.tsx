"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Share2, Twitter, Facebook, MessageCircle, Check } from "lucide-react"
import { toast } from "sonner"

interface SharePollProps {
  pollId: string
  pollTitle: string
}

export function SharePoll({ pollId, pollTitle }: SharePollProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  
  const pollUrl = `${window.location.origin}/polls/${pollId}`
  const shareText = `Check out this poll: "${pollTitle}"`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error("Failed to copy link")
    }
  }

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pollUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pollUrl)}`
    window.open(url, '_blank', 'width=580,height=400')
  }

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${pollUrl}`)}`
    window.open(url, '_blank')
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pollTitle,
          text: shareText,
          url: pollUrl,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback to copying link
      copyToClipboard()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Poll</DialogTitle>
          <DialogDescription>
            Share this poll with others to get more votes
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Copy Link */}
          <div className="space-y-2">
            <Label htmlFor="link">Poll Link</Label>
            <div className="flex space-x-2">
              <Input
                id="link"
                value={pollUrl}
                readOnly
                className="flex-1"
              />
              <Button 
                type="button" 
                size="sm" 
                onClick={copyToClipboard}
                className="px-3"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={shareToTwitter}
                className="flex items-center justify-center gap-2"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareToFacebook}
                className="flex items-center justify-center gap-2"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareToWhatsApp}
                className="flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareNative}
                className="flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                More
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
