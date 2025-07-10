
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Navigation, Phone, Clock, CheckCircle } from "lucide-react";
import { googlePlacesService, PlaceResult } from "@/services/googlePlaces";
import { useToast } from "@/hooks/use-toast";

interface CourtLocationPickerProps {
  value: string;
  onChange: (location: string, details?: PlaceResult) => void;
  userLocation?: { lat: number; lng: number };
  className?: string;
}

const CourtLocationPicker = ({ value, onChange, userLocation, className }: CourtLocationPickerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courts, setCourts] = useState<PlaceResult[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<PlaceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userLocation) {
      findNearbyCourts();
    }
  }, [userLocation]);

  const findNearbyCourts = async () => {
    if (!userLocation) return;
    
    setLoading(true);
    try {
      const nearbyResults = await googlePlacesService.searchTennisCourts(userLocation, 10000);
      setCourts(nearbyResults);
    } catch (error) {
      console.error('Error finding nearby courts:', error);
      toast({
        title: "Error",
        description: "Failed to find nearby tennis courts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchCourts = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const searchResults = await googlePlacesService.searchPlaces(
        `${searchQuery} tennis court`,
        userLocation
      );
      
      // Get place details for each result to verify it's actually a tennis facility
      const detailedResults = await Promise.all(
        searchResults.slice(0, 5).map(async (place) => {
          const details = await googlePlacesService.getPlaceDetails(place.place_id);
          return details;
        })
      );
      
      const validCourts = detailedResults.filter((court): court is PlaceResult => 
        court !== null && 
        (court.types.includes('establishment') || 
         court.types.includes('point_of_interest') ||
         court.name.toLowerCase().includes('tennis') ||
         court.name.toLowerCase().includes('court'))
      );
      
      setCourts(validCourts);
    } catch (error) {
      console.error('Error searching courts:', error);
      toast({
        title: "Error",
        description: "Failed to search for tennis courts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyCourt = async (court: PlaceResult) => {
    setVerifying(true);
    try {
      // Additional verification by getting detailed place information
      const details = await googlePlacesService.getPlaceDetails(court.place_id);
      
      if (details) {
        // Check if this is a legitimate tennis facility
        const isTennisFacility = 
          details.types.some(type => 
            ['establishment', 'point_of_interest', 'park', 'gym'].includes(type)
          ) &&
          (details.name.toLowerCase().includes('tennis') ||
           details.name.toLowerCase().includes('court') ||
           details.name.toLowerCase().includes('club') ||
           details.vicinity?.toLowerCase().includes('tennis'));

        if (isTennisFacility) {
          setSelectedCourt(details);
          onChange(details.formatted_address, details);
          toast({
            title: "Court Verified",
            description: `${details.name} has been verified as a tennis facility`,
          });
        } else {
          toast({
            title: "Verification Failed",
            description: "This location may not be a tennis facility",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error verifying court:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify court location",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const calculateDistance = (court: PlaceResult): string => {
    if (!userLocation) return "";
    
    const R = 3959; // Earth's radius in miles
    const dLat = (court.geometry.location.lat - userLocation.lat) * Math.PI / 180;
    const dLon = (court.geometry.location.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(court.geometry.location.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 ? `${(distance * 5280).toFixed(0)} ft` : `${distance.toFixed(1)} mi`;
  };

  const getCourtType = (court: PlaceResult): string => {
    if (court.types.includes('park')) return 'Public Park';
    if (court.name.toLowerCase().includes('club')) return 'Tennis Club';
    if (court.name.toLowerCase().includes('center') || court.name.toLowerCase().includes('centre')) return 'Tennis Center';
    return 'Tennis Facility';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Tennis Court
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Search for tennis courts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchCourts()}
          />
          <Button onClick={searchCourts} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Selected Court */}
        {selectedCourt && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-emerald-800">{selectedCourt.name}</div>
                <div className="text-sm text-emerald-600">{selectedCourt.formatted_address}</div>
              </div>
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        )}

        {/* Court Results */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {courts.map((court) => (
            <div key={court.place_id} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-semibold">{court.name}</div>
                  <div className="text-sm text-gray-600">{court.formatted_address}</div>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {getCourtType(court)}
                    </Badge>
                    
                    {court.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{court.rating}</span>
                      </div>
                    )}
                    
                    {userLocation && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Navigation className="h-3 w-3" />
                        <span>{calculateDistance(court)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => verifyCourt(court)}
                disabled={verifying}
                size="sm"
                variant="outline"
                className="w-full"
              >
                {verifying ? "Verifying..." : "Select This Court"}
              </Button>
            </div>
          ))}
          
          {courts.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No tennis courts found. Try searching for a specific location.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourtLocationPicker;
