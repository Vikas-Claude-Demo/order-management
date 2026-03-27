import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/session-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OrderFlow | Premium Order Management",
  description: "A modern, efficient order management system for businesses that value speed and reliability.",
  keywords: ["order management", "business tools", "efficiency", "order flow"],
  authors: [{ name: "Brilworks" }],
  openGraph: {
    title: "OrderFlow | Modern Order Management",
    description: "Streamline your business operations with OrderFlow.",
    url: "https://orderflow.brilworks.com",
    siteName: "OrderFlow",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "OrderFlow Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
