import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import LightRays from "@/app/components/ui/LightRays";
import Navbar from "@/app/components/Navbar";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian-Mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevEvent",
  description: "The Hub for Every Developer",
};

/**
 * Defines the application's root HTML layout, global font variables, and top-level UI wrappers.
 *
 * @param children - The page content to render inside the layout's `<main>` element.
 * @returns The root `<html>` element containing a `<body>` with global font classes, the `Navbar`, a positioned `LightRays` background, and a `<main>` that wraps `children`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} min-h-screen antialiased`}
      >
      <Navbar />
      <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>
        <main>
          
          {children}
          </main>
      </body>
    </html>
  );
}