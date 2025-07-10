
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SafetyContact {
  id: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  is_primary: boolean;
}

interface SafetyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchRequestId: string;
  opponentName: string;
  location: string;
  scheduledTime: string;
}

export default function SafetyShareModal({ 
  isOpen, 
  onClose, 
  matchRequestId, 
  opponentName,
  location,
  scheduledTime 
}: SafetyShareModalProps) {
  const [safetyContacts, setSafetyContacts] = useState<SafetyContact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [shareLocation, setShareLocation] = useState(true);
  const [shareOpponentInfo, setShareOpponentInfo] = useState(true);
  const [estimatedDuration, setEstimatedDuration] = useState(120);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    isPrimary: false
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchSafetyContacts();
    }
  }, [isOpen]);

  const fetchSafetyContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('safety_contacts')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      setSafetyContacts(data || []);
      
      const primaryContact = data?.find(contact => contact.is_primary);
      if (primaryContact) {
        setSelectedContactId(primaryContact.id);
      }
    } catch (error) {
      console.error('Error fetching safety contacts:', error);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "Error",
        description: "Name and phone number are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('safety_contacts')
        .insert({
          user_id: user?.id,
          contact_name: newContact.name,
          contact_phone: newContact.phone,
          contact_email: newContact.email || null,
          is_primary: newContact.isPrimary
        })
        .select()
        .single();

      if (error) throw error;

      setSafetyContacts(prev => [...prev, data]);
      setNewContact({ name: '', phone: '', email: '', isPrimary: false });
      setShowAddContact(false);
      
      if (newContact.isPrimary) {
        setSelectedContactId(data.id);
      }

      toast({
        title: "Success",
        description: "Safety contact added successfully",
      });
    } catch (error) {
      console.error('Error adding safety contact:', error);
      toast({
        title: "Error",
        description: "Failed to add safety contact",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('safety_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      setSafetyContacts(prev => prev.filter(contact => contact.id !== contactId));
      if (selectedContactId === contactId) {
        setSelectedContactId('');
      }

      toast({
        title: "Success",
        description: "Safety contact deleted",
      });
    } catch (error) {
      console.error('Error deleting safety contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete safety contact",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!selectedContactId) {
      toast({
        title: "Error",
        description: "Please select a safety contact",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('safety_shares')
        .insert({
          match_request_id: matchRequestId,
          user_id: user?.id,
          safety_contact_id: selectedContactId,
          location_shared: shareLocation,
          opponent_info_shared: shareOpponentInfo,
          estimated_duration_minutes: estimatedDuration
        });

      if (error) throw error;

      toast({
        title: "Safety information shared",
        description: "Your trusted contact has been notified about your match",
      });

      onClose();
    } catch (error) {
      console.error('Error sharing safety information:', error);
      toast({
        title: "Error",
        description: "Failed to share safety information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Share Safety Information
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Match Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Opponent:</span>
                <span className="text-sm font-medium">{opponentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Location:</span>
                <span className="text-sm font-medium">{location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Time:</span>
                <span className="text-sm font-medium">{scheduledTime}</span>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-medium">Safety Contacts</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddContact(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Contact
              </Button>
            </div>

            {showAddContact && (
              <Card className="mb-4">
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newContact.name}
                        onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={newContact.phone}
                        onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email address"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPrimary"
                      checked={newContact.isPrimary}
                      onCheckedChange={(checked) => 
                        setNewContact(prev => ({ ...prev, isPrimary: checked === true }))
                      }
                    />
                    <Label htmlFor="isPrimary" className="text-sm">
                      Make this my primary contact
                    </Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddContact(false)}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddContact}>
                      Add Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {safetyContacts.length > 0 ? (
              <div className="space-y-2">
                <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a safety contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {safetyContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.contact_name} ({contact.contact_phone})
                        {contact.is_primary && ' - Primary'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  {safetyContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{contact.contact_name}</div>
                        <div className="text-xs text-muted-foreground">{contact.contact_phone}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No safety contacts added yet. Add one above to continue.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">What to share</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shareLocation"
                  checked={shareLocation}
                  onCheckedChange={(checked) => setShareLocation(checked === true)}
                />
                <Label htmlFor="shareLocation" className="text-sm">
                  Share match location
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shareOpponent"
                  checked={shareOpponentInfo}
                  onCheckedChange={(checked) => setShareOpponentInfo(checked === true)}
                />
                <Label htmlFor="shareOpponent" className="text-sm">
                  Share opponent information
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="duration" className="text-sm">
                Estimated match duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                className="mt-1"
                min="30"
                max="300"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={loading || !selectedContactId}>
              {loading ? 'Sharing...' : 'Share Safety Info'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
