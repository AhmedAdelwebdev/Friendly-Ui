import { Fugaz_One, Baloo_2, Tajawal } from "next/font/google";
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

const tajawal = Tajawal({
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  subsets: ["arabic"],
});

export const metadata = {
  title: "Friendly UI",
  description:
    "Friendly UI offers premium website templates, UI kits, and digital assets. Professional designs crafted for speed, elegance, and high conversion. Start building your dream project today.",
  icons: {
    icon: "/favicon.ico",
  },
  keywords: [
    "Friendly UI", "UI Kits", "Website Templates", "Next.js Templates", "Tailwind CSS", "Premium Design", "Web Design Assets", "Dashboard Templates"
  ],
  authors: [{ name: "Ahmed Adel" }],
  creator: "Ahmed Adel",
  metadataBase: new URL("https://friendlyui.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Friendly UI",
    description:
      "Modern UI kits and website templates for creative developers and designers. Fast, elegant, and professional.",
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
    <html lang="en" className={`${fugazOne.variable} ${baloo2.variable} ${tajawal.variable} h-full antialiased`} suppressHydrationWarning >
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Friendly UI",
            "url": "https://friendlyui.vercel.app",
            "description": "Premium Digital Assets & UI Kits for designers and developers.",
            "author": {
              "@type": "Person",
              "name": "Ahmed Adel"
            }
          })
        }} />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const savedTheme = localStorage.getItem('friendly_theme');
              if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (_) {}
          `
        }} />
      </head>

      <body className="min-h-full w-full maxWidth mx-auto flex flex-col font-baloo selection:bg-primary/20" suppressHydrationWarning>
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
