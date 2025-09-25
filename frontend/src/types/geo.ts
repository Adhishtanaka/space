export interface Friend {
  id: string | number;
  name: string;
  gender: string;
  email: string;
  lat: number;
  lng: number;
}

export interface MapControlsProps {
  updateLocation: () => void;
  loading: boolean;
  geoError: string | null;
  friends: Array<{ id: string | number; name: string; lat: number; lng: number }>;
  isDark: boolean;
}

export interface MapViewProps {
  mounted: boolean;
  activeTheme: string;
  tileConfig: { attribution: string; url: string };
  center: { lat: number; lng: number };
  mapRef: React.MutableRefObject<L.Map | null>;
  hasLocation: boolean;
  user: { firstName?: string; gender?: string } | null;
  friends: Friend[];
  isDark: boolean;
}

export interface UserGeo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  geohash?: string;
  gender: string; 
}