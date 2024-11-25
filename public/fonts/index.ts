import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const bravura = localFont({
  src: "bravura/bravura.woff2",
  variable: "--music-font",
});
export const bravuraText = localFont({
  src: "bravura/bravura-text.woff2",
  variable: "--music-text-font",
});
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--text-font",
});
