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
    pageBg: "linear-gradient(160deg, #1a0d05 0%, #251507 60%, #2e1a08 100%)",
    cardBg: "#2a1508",
    cardBorder: "#4a2e18",
    inputBg: "#351a08",
    inputBorder: "#5a3a22",
    text: "#f0dcc8",
    textSub: "#c9a070",
    textMuted: "#7a5a3a",
    chipBg: "#351a08",
    chipText: "#c9a070",
    spinnerOverlay: "rgba(26, 13, 5, 0.88)",
    shimmerFrom: "#2a1508",
    shimmerMid: "#3a1f0a",
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
