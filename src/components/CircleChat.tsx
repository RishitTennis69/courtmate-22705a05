
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
  user_profiles?: {
    full_name: string | null
    profile_image_url: string | null
  }
}

interface CircleChatProps {
  circleId: string
  circleName: string
}

export default function CircleChat({ circleId, circleName }: CircleChatProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    fetchMessages()
    subscribeToMessages()
  }, [circleId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("circle_messages")
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq("circle_id", circleId)
        .order("created_at", { ascending: true })

      if (error) throw error

      // Fetch user profiles separately
      const userIds = [...new Set(data?.map(msg => msg.user_id) || [])]
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, full_name, profile_image_url")
        .in("id", userIds)

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])
      
      const messagesWithProfiles = (data || []).map(message => ({
        ...message,
        user_profiles: profilesMap.get(message.user_id) || null
      }))

      setMessages(messagesWithProfiles)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      })
    }
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`circle-messages-${circleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'circle_messages',
          filter: `circle_id=eq.${circleId}`
        },
        async (payload) => {
          const newMessage = payload.new as Message
          
          // Fetch user profile for the new message
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("full_name, profile_image_url")
            .eq("id", newMessage.user_id)
            .single()

          setMessages(prev => [...prev, {
            ...newMessage,
            user_profiles: profile
          }])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !newMessage.trim()) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from("circle_messages")
        .insert({
          circle_id: circleId,
          user_id: user.id,
          content: newMessage.trim()
        })

      if (error) throw error

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{circleName} Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.user_profiles?.profile_image_url || ""} />
                  <AvatarFallback>
                    {message.user_profiles?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {message.user_profiles?.full_name || "Unknown User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
