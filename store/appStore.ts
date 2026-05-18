import { create } from "zustand";
import type { Restaurant, UserLocation, FoodCategory, AppScreen } from "@/types";

const ALL_CATEGORIES: FoodCategory[] = [
  "Local / Malay", "Chinese", "Indian", "Western",
  "Japanese / Korean", "Fast Food", "Cafe / Drinks",
];

const ALL_PRICES: Array<"💰" | "💰💰" | "💰💰💰"> = ["💰", "💰💰", "💰💰💰"];

const SPECIAL_FILTERS: { key: string; label: string; emoji: string }[] = [
  { key: "ayam gepok", label: "Ayam Gepok", emoji: "🍗" },
  { key: "matcha", label: "Matcha", emoji: "🍵" },
];

interface AppState {
  screen: AppScreen;
  userLocation: UserLocation | null;
  allRestaurants: Restaurant[];
  specialRestaurants: Restaurant[];
  selectedCategories: Set<FoodCategory>;
  selectedPrices: Set<"💰" | "💰💰" | "💰💰💰">;
  specialFilters: Set<string>;
  excludedIds: Set<number>;
  radius: number;
  result: Restaurant | null;
  darkMode: boolean;

  setScreen: (s: AppScreen) => void;
  setLocation: (loc: UserLocation) => void;
  setRestaurants: (list: Restaurant[]) => void;
  setSpecialRestaurants: (list: Restaurant[]) => void;
  toggleCategory: (cat: FoodCategory) => void;
  togglePrice: (p: "💰" | "💰💰" | "💰💰💰") => void;
  toggleSpecialFilter: (filter: string) => void;
  toggleExclude: (id: number) => void;
  clearExcludes: () => void;
  excludeAll: (ids: number[]) => void;
  setRadius: (r: number) => void;
  setResult: (r: Restaurant | null) => void;
  reset: () => void;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  screen: "home",
  userLocation: null,
  allRestaurants: [],
  specialRestaurants: [],
  selectedCategories: new Set(ALL_CATEGORIES),
  selectedPrices: new Set(ALL_PRICES),
  specialFilters: new Set<string>(),
  excludedIds: new Set<number>(),
  radius: 800,
  result: null,
  darkMode: false,

  setScreen: (screen) => set({ screen }),
  setLocation: (userLocation) => set({ userLocation }),
  setRestaurants: (allRestaurants) => set({ allRestaurants }),
  setSpecialRestaurants: (specialRestaurants) => set({ specialRestaurants }),
  toggleCategory: (cat) =>
    set((state) => {
      const next = new Set(state.selectedCategories);
      if (next.has(cat) && next.size === 1) return {};
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return { selectedCategories: next };
    }),
  togglePrice: (p) =>
    set((state) => {
      const next = new Set(state.selectedPrices);
      if (next.has(p) && next.size === 1) return {};
      next.has(p) ? next.delete(p) : next.add(p);
      return { selectedPrices: next };
    }),
  toggleSpecialFilter: (filter) =>
    set((state) => {
      const next = new Set(state.specialFilters);
      next.has(filter) ? next.delete(filter) : next.add(filter);
      return { specialFilters: next };
    }),
  toggleExclude: (id) =>
    set((state) => {
      const next = new Set(state.excludedIds);
      next.has(id) ? next.delete(id) : next.add(id);
      return { excludedIds: next };
    }),
  clearExcludes: () => set({ excludedIds: new Set<number>() }),
  excludeAll: (ids) => set({ excludedIds: new Set(ids) }),
  setRadius: (radius) => set({ radius }),
  setResult: (result) => set({ result }),
  reset: () =>
    set({
      screen: "home",
      userLocation: null,
      allRestaurants: [],
      specialRestaurants: [],
      selectedCategories: new Set(ALL_CATEGORIES),
      selectedPrices: new Set(ALL_PRICES),
      specialFilters: new Set<string>(),
      excludedIds: new Set<number>(),
      radius: 800,
      result: null,
    }),
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      if (typeof window !== "undefined") {
        localStorage.setItem("makanape-dark", next ? "1" : "0");
      }
      return { darkMode: next };
    }),
}));

export { ALL_CATEGORIES, ALL_PRICES, SPECIAL_FILTERS };
