
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
  types: string[];
}

export class GooglePlacesService {
  async searchPlaces(query: string, location?: { lat: number; lng: number }): Promise<PlacePrediction[]> {
    try {
      const { data, error } = await supabase.functions.invoke('search-places', {
        body: { 
          query,
          location: location ? `${location.lat},${location.lng}` : undefined,
          types: 'geocode'
        }
      });

      if (error) throw error;
      return data?.predictions || [];
    } catch (error) {
      console.error('Failed to search places:', error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    try {
      const { data, error } = await supabase.functions.invoke('get-place-details', {
        body: { placeId }
      });

      if (error) throw error;
      return data?.result || null;
    } catch (error) {
      console.error('Failed to get place details:', error);
      return null;
    }
  }

  async searchTennisCourts(location: { lat: number; lng: number }, radius: number = 5000): Promise<PlaceResult[]> {
    try {
      const { data, error } = await supabase.functions.invoke('search-tennis-courts', {
        body: { 
          location: `${location.lat},${location.lng}`,
          radius,
          keyword: 'tennis court'
        }
      });

      if (error) throw error;
      return data?.results || [];
    } catch (error) {
      console.error('Failed to search tennis courts:', error);
      return [];
    }
  }

  async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null);
        }
      );
    });
  }

  async searchNearbyPlaces(query: string): Promise<PlacePrediction[]> {
    try {
      const currentLocation = await this.getCurrentLocation();
      return this.searchPlaces(query, currentLocation || undefined);
    } catch (error) {
      console.error('Failed to search nearby places:', error);
      return this.searchPlaces(query);
    }
  }
}

export const googlePlacesService = new GooglePlacesService();
