import { Geist, Geist_Mono } from "next/font/google"
import type { Metadata, Viewport } from 'next'

import "@workspace/ui/globals.css"
import { Providers } from '../components/providers'
import Footer from '../components/layout/Footer'

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://jaddpi.com'),
  title: {
    default: 'Jaddpi - Real-Time Parcel Delivery in Surrey & Langley BC',
    template: '%s | Jaddpi Delivery'
  },
  description: 'Ship parcels with real-time tracking in Surrey and Langley, BC. Fast, reliable local delivery service for anyone. Door-to-door courier with live tracking and instant quotes.',
  keywords: [
    'parcel delivery Surrey BC',
    'parcel delivery Langley BC',
    'courier Surrey',
    'courier Langley',
    'real-time tracking',
    'live tracking delivery',
    'local delivery Surrey',
    'local delivery Langley',
    'same-day delivery',
    'door-to-door delivery',
    'British Columbia delivery',
    'BC courier service',
    'package shipping Surrey',
    'package shipping Langley',
    'fast delivery BC',
    'on-demand delivery'
  ],
  authors: [{ name: 'Jaddpi' }],
  creator: 'Jaddpi',
  publisher: 'Jaddpi',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: '/',
    siteName: 'Jaddpi',
    title: 'Jaddpi - Real-Time Parcel Delivery in Surrey & Langley BC',
    description: 'Ship parcels with real-time tracking in Surrey and Langley, BC. Fast, reliable local delivery service for anyone.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Jaddpi - Real-Time Parcel Delivery in Surrey & Langley BC',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jaddpi - Real-Time Parcel Delivery in Surrey & Langley BC',
    description: 'Ship parcels with real-time tracking in Surrey and Langley, BC. Fast, reliable local delivery service.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://jaddpi.com",
    "name": "Jaddpi",
    "description": "Real-time parcel delivery service in Surrey and Langley, BC. Fast, reliable door-to-door courier with live tracking.",
    "url": "https://jaddpi.com",
    "telephone": "+1-236-339-7355",
    "priceRange": "$$",
    "image": "https://jaddpi.com/logo.png",
    "logo": "https://jaddpi.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Surrey",
      "addressRegion": "BC",
      "addressCountry": "CA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "49.1913",
      "longitude": "-122.8490"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Surrey",
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "British Columbia"
        }
      },
      {
        "@type": "City",
        "name": "Langley",
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "British Columbia"
        }
      }
    ],
    "serviceType": [
      "Parcel Delivery",
      "Courier Service",
      "Real-Time Tracking",
      "Door-to-Door Delivery",
      "Local Delivery"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Delivery Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Real-Time Parcel Delivery",
            "description": "Fast parcel delivery with live GPS tracking in Surrey and Langley, BC"
          }
        }
      ]
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "08:00",
      "closes": "20:00"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
