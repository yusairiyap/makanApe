export function pseudoRating(id: number): number {
  return Math.round(((id % 30) / 10 + 3) * 10) / 10;
}

export function pseudoPrice(id: number): "💰" | "💰💰" | "💰💰💰" {
  const v = id % 3;
  return v === 0 ? "💰" : v === 1 ? "💰💰" : "💰💰💰";
}

export function nameHash(s: string, seed = 0): number {
  let h = seed;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i);
  }
  return h >>> 0;
}
