
-- Create table for real-time messages between users
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users NOT NULL,
  receiver_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for push notifications
CREATE TABLE public.push_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('match_reminder', 'new_message', 'match_request', 'general')),
  data JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user reports and blocking
CREATE TABLE public.user_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users NOT NULL,
  reported_id UUID REFERENCES auth.users NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate_behavior', 'harassment', 'fake_profile', 'no_show', 'safety_concern', 'other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for blocked users
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID REFERENCES auth.users NOT NULL,
  blocked_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Create table for safety contacts
CREATE TABLE public.safety_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for first match safety sharing
CREATE TABLE public.safety_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_request_id UUID REFERENCES public.match_requests NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  safety_contact_id UUID REFERENCES public.safety_contacts NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location_shared BOOLEAN DEFAULT true,
  opponent_info_shared BOOLEAN DEFAULT true,
  estimated_duration_minutes INTEGER DEFAULT 120
);

-- Enable RLS on all new tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_shares ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their received messages" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Push notifications policies
CREATE POLICY "Users can view their notifications" ON public.push_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.push_notifications FOR UPDATE USING (auth.uid() = user_id);

-- User reports policies
CREATE POLICY "Users can view their reports" ON public.user_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON public.user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Blocked users policies
CREATE POLICY "Users can view their blocks" ON public.blocked_users FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users can manage their blocks" ON public.blocked_users FOR ALL USING (auth.uid() = blocker_id);

-- Safety contacts policies
CREATE POLICY "Users can manage their safety contacts" ON public.safety_contacts FOR ALL USING (auth.uid() = user_id);

-- Safety shares policies
CREATE POLICY "Users can view their safety shares" ON public.safety_shares FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create safety shares" ON public.safety_shares FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(sender_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.messages 
  SET read_at = now(), updated_at = now()
  WHERE receiver_id = auth.uid() 
    AND sender_id = sender_user_id 
    AND read_at IS NULL;
END;
$$;

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION public.get_unread_message_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM public.messages
  WHERE receiver_id = auth.uid() AND read_at IS NULL;
  
  RETURN unread_count;
END;
$$;
