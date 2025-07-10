
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        toast({
          title: "Authorization Error",
          description: error,
          variant: "destructive",
        });
        navigate('/settings');
        return;
      }

      if (!code) {
        toast({
          title: "Error",
          description: "No authorization code received",
          variant: "destructive",
        });
        navigate('/settings');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('google-oauth-callback', {
          body: { code }
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Google Calendar connected successfully!",
        });

        // Close the popup window if this is running in a popup
        if (window.opener) {
          window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
          window.close();
        } else {
          navigate('/settings');
        }
      } catch (error) {
        console.error('Callback error:', error);
        toast({
          title: "Connection Failed",
          description: "Failed to connect Google Calendar. Please try again.",
          variant: "destructive",
        });
        navigate('/settings');
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Connecting your Google Calendar...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
