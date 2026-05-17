import type { FoodCategory } from "@/types";

const MALAY_KEYWORDS = ["nasi", "mee", "laksa", "roti", "mamak", "warung", "kedai", "char", "ayam", "lemak", "satay", "rendang"];
const CHINESE_KEYWORDS = ["dim sum", "wonton", "bak kut", "kopitiam", "char siu", "claypot", "economy rice", "porridge", "congee"];
const INDIAN_KEYWORDS = ["briyani", "biryani", "banana leaf", "chapati", "thosai", "dosai", "curry", "tandoor", "naan"];
const JAPANESE_KEYWORDS = ["sushi", "ramen", "udon", "tempura", "teriyaki", "izakaya", "korean", "bbq", "hotpot", "bulgogi", "bibimbap"];
const WESTERN_KEYWORDS = ["burger", "pizza", "pasta", "steak", "sandwich", "western", "grill", "bistro", "brasserie"];
const CAFE_KEYWORDS = ["cafe", "coffee", "tea", "bubble", "boba", "dessert", "cake", "bakery", "juice", "smoothie"];

function matchesKeywords(name: string, keywords: string[]): boolean {
  const lower = name.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

export function mapOSMTagsToCategory(
  name: string,
  cuisine: string | undefined,
  amenity: string
): FoodCategory {
  const combined = `${name} ${cuisine ?? ""}`.toLowerCase();

  if (matchesKeywords(combined, CAFE_KEYWORDS) || amenity === "cafe") return "Cafe / Drinks";
  if (matchesKeywords(combined, JAPANESE_KEYWORDS)) return "Japanese / Korean";
  if (matchesKeywords(combined, WESTERN_KEYWORDS)) return "Western";
  if (matchesKeywords(combined, INDIAN_KEYWORDS)) return "Indian";
  if (matchesKeywords(combined, CHINESE_KEYWORDS)) return "Chinese";
  if (amenity === "fast_food") return "Fast Food";
  if (matchesKeywords(combined, MALAY_KEYWORDS)) return "Local / Malay";

  return "Local / Malay";
}

export function getCategoryEmoji(category: FoodCategory): string {
  const map: Record<FoodCategory, string> = {
    "Local / Malay": "🍛",
    Chinese: "🥢",
    Indian: "🫓",
    Western: "🍔",
    "Japanese / Korean": "🍱",
    "Fast Food": "🍟",
    "Cafe / Drinks": "☕",
  };
  return map[category];
}
