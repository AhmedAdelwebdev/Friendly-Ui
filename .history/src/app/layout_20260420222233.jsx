import { Fugaz_One, Baloo_2 } from "next/font/google";
import "./globals.css";
import { OrdersProvider } from "@/lib/CartContext";

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
  description: "Ahmed Adel - Professional UI/UX Designer and Creative Developer",
};

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { PaymentModal } from "@/components/payment/PaymentModal";
import ClientProviders from "@/components/ClientProviders";
import SecurityLock from "@/components/SecurityLock";
import { headers } from "next/headers";

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
          <main className="flex-1  w-full">
            {children}
          </main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
