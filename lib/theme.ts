export interface AppTheme {
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  inputBg: string;
  inputBorder: string;
  text: string;
  textSub: string;
  textMuted: string;
  chipBg: string;
  chipText: string;
  spinnerOverlay: string;
  shimmerFrom: string;
  shimmerMid: string;
}

export function getTheme(dark: boolean): AppTheme {
  if (dark) return {
    pageBg: "linear-gradient(160deg, #0d0500 0%, #170900 60%, #200c02 100%)",
    cardBg: "#2e1508",
    cardBorder: "#4d2210",
    inputBg: "#3a1a0a",
    inputBorder: "#5a2e14",
    text: "#f0dcc8",
    textSub: "#c9a070",
    textMuted: "#6a4a28",
    chipBg: "#3a1a0a",
    chipText: "#c9a070",
    spinnerOverlay: "rgba(13, 5, 0, 0.92)",
    shimmerFrom: "#2e1508",
    shimmerMid: "#3e1c0a",
  };
  return {
    pageBg: "linear-gradient(160deg, #FFF8F0 0%, #FDEBD0 60%, #ffe0c0 100%)",
    cardBg: "#fff",
    cardBorder: "#f0e0cc",
    inputBg: "#fff",
    inputBorder: "#f0d5b5",
    text: "#3d2b1a",
    textSub: "#7a5a40",
    textMuted: "#c9a882",
    chipBg: "#fff",
    chipText: "#7a5a40",
    spinnerOverlay: "rgba(255, 248, 240, 0.82)",
    shimmerFrom: "#f5e8d8",
    shimmerMid: "#fdebd0",
  };
}
