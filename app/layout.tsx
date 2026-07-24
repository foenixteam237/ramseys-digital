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

export const metadata: Metadata = {
  title: "Ramseys Digital | Solutions IT & services numériques",
  description:
    "Ramseys Digital accompagne les entreprises avec des services informatiques fiables, maintenance, solutions digitales et audit réseau à Maroua, Cameroun.",
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
