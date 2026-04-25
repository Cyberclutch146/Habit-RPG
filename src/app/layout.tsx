import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "../index.css";
import TopBar from "../components/layout/TopBar";
import BottomNav from "../components/layout/BottomNav";
import LootDropModal from "../components/rpg/LootDropModal";
import MissionBoard from "../components/rpg/MissionBoard";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "SHADOW_OPERATIVE // Habit-RPG",
  description: "Gamified productivity with stealth action vibes.",
};

import FirebaseInitializer from "../components/FirebaseInitializer";
import ThemeProvider from "../components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${outfit.variable} antialiased bg-slate-50 text-slate-900 selection:bg-indigo-200 selection:text-indigo-900 min-h-screen flex flex-col font-body`}
      >
        <FirebaseInitializer>
          <ThemeProvider>
            <TopBar />
            <main className="flex-1 overflow-y-auto pt-16 mb-20 md:mb-0">
              {children}
            </main>
            <BottomNav />
            <LootDropModal />
            <MissionBoard />
          </ThemeProvider>
        </FirebaseInitializer>
      </body>
    </html>
  );
}

