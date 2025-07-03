
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface CircleCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCircleCreated: () => void
}

export default function CircleCreationModal({ 
  open, 
  onOpenChange, 
  onCircleCreated 
}: CircleCreationModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    isPrivate: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Circle name and description are required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Create the circle
      const { data: circle, error: circleError } = await supabase
        .from("circles")
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim(),
          location: formData.location.trim() || null,
          is_private: formData.isPrivate,
          created_by: user.id
        })
        .select()
        .single()

      if (circleError) throw circleError

      // Add creator as a member with admin role
      const { error: memberError } = await supabase
        .from("circle_members")
        .insert({
          circle_id: circle.id,
          user_id: user.id,
          role: "admin"
        })

      if (memberError) throw memberError

      toast({
        title: "Success",
        description: "Circle created successfully!"
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        location: "",
        isPrivate: false
      })

      onOpenChange(false)
      onCircleCreated()
    } catch (error) {
      console.error("Error creating circle:", error)
      toast({
        title: "Error",
        description: "Failed to create circle. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Circle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Circle Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter circle name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your circle"
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Circle location (optional)"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="private"
              checked={formData.isPrivate}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
            />
            <Label htmlFor="private">Private Circle</Label>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Circle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
