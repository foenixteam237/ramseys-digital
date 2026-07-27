import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ramseys-digital.vercel.app";
const siteName = "Ramseys Digital";
const siteDescription =
  "Ramseys Digital accompagne les entreprises avec des services informatiques fiables, maintenance, solutions digitales et audit réseau à Maroua, Cameroun.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ramseys Digital | Solutions IT & services numériques",
    template: "%s | Ramseys Digital",
  },
  description: siteDescription,
  keywords: [
    "services informatiques Maroua",
    "maintenance informatique Cameroun",
    "audit réseau",
    "solutions digitales",
    "Ramseys Digital",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName,
    title: "Ramseys Digital | Solutions IT & services numériques",
    description: siteDescription,
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ramseys Digital | Solutions IT & services numériques",
    description: siteDescription,
    images: ["/logo.png"],
  },
  icons: {
    icon: "/icon.svg",
  },
};

import { Providers } from "./providers";

const themeScript = `(function(){try{var t=localStorage.getItem('theme')||'light';if(t==='system'){document.documentElement.removeAttribute('data-theme');}else{document.documentElement.setAttribute('data-theme',t);}}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-rd-deep text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}