import { create } from "zustand";
import type { Restaurant, UserLocation, FoodCategory, AppScreen } from "@/types";

const ALL_CATEGORIES: FoodCategory[] = [
  "Local / Malay", "Chinese", "Indian", "Western",
  "Japanese / Korean", "Fast Food", "Cafe / Drinks",
];

interface AppState {
  screen: AppScreen;
  userLocation: UserLocation | null;
  allRestaurants: Restaurant[];
  selectedCategories: Set<FoodCategory>;
  excludedIds: Set<number>;
  radius: number;
  result: Restaurant | null;

  setScreen: (s: AppScreen) => void;
  setLocation: (loc: UserLocation) => void;
  setRestaurants: (list: Restaurant[]) => void;
  toggleCategory: (cat: FoodCategory) => void;
  toggleExclude: (id: number) => void;
  setRadius: (r: number) => void;
  setResult: (r: Restaurant | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  screen: "home",
  userLocation: null,
  allRestaurants: [],
  selectedCategories: new Set(ALL_CATEGORIES),
  excludedIds: new Set<number>(),
  radius: 1000,
  result: null,

  setScreen: (screen) => set({ screen }),
  setLocation: (userLocation) => set({ userLocation }),
  setRestaurants: (allRestaurants) => set({ allRestaurants }),
  toggleCategory: (cat) =>
    set((state) => {
      const next = new Set(state.selectedCategories);
      if (next.has(cat) && next.size === 1) return {};
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return { selectedCategories: next };
    }),
  toggleExclude: (id) =>
    set((state) => {
      const next = new Set(state.excludedIds);
      next.has(id) ? next.delete(id) : next.add(id);
      return { excludedIds: next };
    }),
  setRadius: (radius) => set({ radius }),
  setResult: (result) => set({ result }),
  reset: () =>
    set({
      screen: "home",
      userLocation: null,
      allRestaurants: [],
      selectedCategories: new Set(ALL_CATEGORIES),
      excludedIds: new Set<number>(),
      radius: 1000,
      result: null,
    }),
}));

export { ALL_CATEGORIES };
