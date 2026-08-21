import type { Metadata, Viewport } from "next";
import { Amiri, Fraunces, Inter, Lora } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/lib/audio/player-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Saadat — Qur'an. Peace. Focus.",
  description:
    "A digital sanctuary for Qur'an listening. Choose your reciter, select your atmosphere, and listen in peace.",
};

export const viewport: Viewport = {
  themeColor: "#08080b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${lora.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink text-mist">
        <PlayerProvider>{children}</PlayerProvider>
      </body>
    </html>
  );
}
