export interface Trip {
  id: string;
  title: string;
  description: string | null;
  owner: string;
  created_at: string;
  start_date: string | null;
  end_date: string | null;
  cover_url: string | null;
  font: string;
}

export type TripMemberRole = 'owner' | 'editor' | 'viewer';

export interface TripMember {
  trip_id: string;
  user_id: string;
  role: TripMemberRole;
  email: string;
  created_at: string;
}

export interface TripInvitation {
  id: string;
  trip_id: string;
  email: string;
  role: TripMemberRole;
  invited_by: string;
  created_at: string;
}

export type InviteResult =
  | { status: 'added'; user_id: string; email: string; role: TripMemberRole }
  | { status: 'invited'; invitation_id: string; email: string; role: TripMemberRole };

export interface NewTripInput {
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface TripUpdate {
  title?: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  cover_url?: string | null;
  font?: string;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_date: string;
  created_at: string;
}

export type PriceDistributionType = 'equal' | 'assigned' | 'per_person';

export interface Activity {
  id: string;
  day_id: string;
  trip_id: string;
  title: string;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  link: string | null;
  completed: boolean;
  order_index: number;
  created_at: string;
  price: number | null;
  priceDistribution: PriceDistributionType | null;
  priceAssignedMembers: string[] | null;
}

export interface NewActivityInput {
  title: string;
  description?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  link?: string | null;
  price?: number | null;
  priceDistribution?: PriceDistributionType | null;
  priceAssignedMembers?: string[] | null;
}

export interface ActivityUpdate {
  title?: string;
  description?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  link?: string | null;
  completed?: boolean;
  order_index?: number;
  price?: number | null;
  priceDistribution?: PriceDistributionType | null;
  priceAssignedMembers?: string[] | null;
}

export interface UserProfile {
  id: string;
  avatar_url: string | null;
  updated_at: string;
}

export const TRIP_FONTS = [
  { id: 'outfit', label: 'Outfit', family: "'Outfit', sans-serif" },
  { id: 'inter', label: 'Inter', family: "'Inter', sans-serif" },
  { id: 'playfair', label: 'Playfair', family: "'Playfair Display', serif" },
  { id: 'space', label: 'Space Grotesk', family: "'Space Grotesk', sans-serif" },
] as const;

export type TripFontId = (typeof TRIP_FONTS)[number]['id'];

export function getFontFamily(fontId: string): string {
  return TRIP_FONTS.find((f) => f.id === fontId)?.family ?? "'Outfit', sans-serif";
}
