"use client";

import { Inter, Lexend } from "next/font/google";

import { Toaster } from "@/components/atoms/sonner";
import Footer from "@/components/organisms/footer";
import Header from "@/components/organisms/header";
import RootProvider from "@/providers";
import { cn } from "@/utils";

const inter = Inter({ subsets: ["latin"], preload: true });
const lexend = Lexend({
  subsets: ["latin"],
  preload: true,
  variable: "--font-lexend",
});

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={cn("flex w-screen", inter.className, lexend.variable)}>
        <RootProvider>
          <div className="flex flex-col gap-2 w-full min-h-screen">
            <Header />
            {children}
            <Footer />
          </div>
        </RootProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default LayoutWrapper;
