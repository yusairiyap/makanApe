export type FoodCategory =
  | "Local / Malay"
  | "Chinese"
  | "Indian"
  | "Western"
  | "Japanese / Korean"
  | "Fast Food"
  | "Cafe / Drinks";

export interface Restaurant {
  id: number;
  name: string;
  category: FoodCategory;
  distance: number;
  rating: number;
  address: string;
  lat: number;
  lng: number;
  emoji: string;
  priceRange: "💰" | "💰💰" | "💰💰💰";
  openNow: boolean | null;
}

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
}

export type AppScreen = "locating" | "loading" | "home" | "result";
