
import { supabase } from "@/integrations/supabase/client";

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  vicinity?: string;
}

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export class GooglePlacesService {
  async searchPlaces(query: string, location?: { lat: number; lng: number }): Promise<PlacePrediction[]> {
    try {
      const { data } = await supabase.functions.invoke('search-places', {
        body: { 
          query,
          location: location ? `${location.lat},${location.lng}` : undefined
        }
      });
      return data?.predictions || [];
    } catch (error) {
      console.error('Failed to search places:', error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    try {
      const { data } = await supabase.functions.invoke('get-place-details', {
        body: { placeId }
      });
      return data?.result || null;
    } catch (error) {
      console.error('Failed to get place details:', error);
      return null;
    }
  }

  async searchTennisCourts(location: { lat: number; lng: number }, radius: number = 5000): Promise<PlaceResult[]> {
    try {
      const { data } = await supabase.functions.invoke('search-tennis-courts', {
        body: { 
          location: `${location.lat},${location.lng}`,
          radius 
        }
      });
      return data?.results || [];
    } catch (error) {
      console.error('Failed to search tennis courts:', error);
      return [];
    }
  }
}

export const googlePlacesService = new GooglePlacesService();
