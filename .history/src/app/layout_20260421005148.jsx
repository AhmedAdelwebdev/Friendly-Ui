import { Fugaz_One, Baloo_2 } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { PaymentModal } from "@/components/payment/PaymentModal";
import ClientProviders from "@/components/ClientProviders";
import SecurityLock from "@/components/SecurityLock";
import { headers } from "next/headers";


const fugazOne = Fugaz_One({
  weight: "400",
  variable: "--font-fugaz-one",
  subsets: ["latin"],
});

const baloo2 = Baloo_2({
  variable: "--font-baloo-2",
  subsets: ["latin"],
});

export const metadata = {
  title: "Friendly UI",
  description:
    "Friendly UI is a premium creative hub offering modern UI kits, templates, and digital assets for designers and developers. Crafted for speed, elegance, and seamless user experience.",
  icons: {
    icon: "/favicon.ico",
  },
  keywords: [
    "Friendly UI",
    "Friendly UI templates",
    "Friendly UI ui kits",
    "Friendly UI digital assets",
    "Friendly UI templates",
    "Friendly UI templates",
    "website templates",
    "dashboard templates",
    "react templates",
    "next.js templates",
    "tailwind css templates",
    "admin dashboard ui",
    "landing page templates",
    "ui components",
    "ui kits",
    "figma ui kits",
    "web design templates",
    "premium website templates",
    "react ui kit",
    "modern web templates",
    "frontend templates",
    "responsive website templates",
    "digital design assets",
    "web ui resources",
    "saas templates",
    "creative website templates"
  ],
  authors: [{ name: "Ahmed Adel" }],
  creator: "Ahmed Adel",
  metadataBase: new URL("https://friendlyui.vercel.app"),
  openGraph: {
    title: "Friendly UI",
    description:
      "Discover premium UI kits, templates, and creative digital assets built for designers and developers.",
    url: "https://friendlyui.vercel.app",
    siteName: "Friendly UI",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
        alt: "Friendly UI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Friendly UI",
    description:
      "Modern templates and digital assets for creative developers and designers.",
    images: ["/favicon.ico"],
  },
};


export default async function RootLayout({ children }) {
  const h = await headers();
  const host = h.get("host");
  const protocol = h.get("x-forwarded-proto") || "http";

  return (
    <html lang="en" className={`${fugazOne.variable} ${baloo2.variable} h-full antialiased`} suppressHydrationWarning >
      <head>
      </head>

      <body className="min-h-full w-full max-w-6xl mx-auto flex flex-col font-baloo" suppressHydrationWarning>
        <ClientProviders>
          {/* <SecurityLock /> */}
          <Header />
          <CartSidebar />
          <PaymentModal host={host} protocol={protocol} />
          <main className="flex-1 w-full">
            {children}
          </main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
