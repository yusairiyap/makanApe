import type { Restaurant } from "@/types";

export async function shareRestaurant(restaurant: Restaurant): Promise<void> {
  const text = `🍽️ makan ape? Let's eat at ${restaurant.name}!\n${restaurant.emoji} ${restaurant.category} — ${restaurant.distance}m away\n\nDecided by makanApe 🎡 — makan ape? Let the wheel decide!`;
  const url = window.location.href;

  if (navigator.share) {
    await navigator.share({ title: "makanApe picked!", text, url });
  } else {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    alert("Copied to clipboard! Share la with your kawan-kawan 😄");
  }
}
