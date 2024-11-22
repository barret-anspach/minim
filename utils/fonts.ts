import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const bravura = localFont({
  src: "../public/fonts/bravura/woff/bravura.woff2",
  variable: "--music-font",
});
export const bravuraText = localFont({
  src: "../public/fonts/bravura/woff/bravura-text.woff2",
});
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--text-font",
});
