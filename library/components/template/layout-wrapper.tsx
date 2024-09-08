"use client";

import { Inter, Lexend } from "next/font/google";

import { Toaster } from "@/components/atoms/sonner";
import Footer from "@/components/organisms/footer";
import Header from "@/components/organisms/header";
import RootProvider from "@/providers";
import { cn } from "@/utils";
import NextTopLoader from "nextjs-toploader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ["latin"], preload: true });
const lexend = Lexend({
  subsets: ["latin"],
  preload: true,
  variable: "--font-lexend",
});

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={cn("flex w-full", inter.className, lexend.variable)}>
        <RootProvider>
          <div className="flex flex-col w-full min-h-screen overflow-x-hidden">
            <Header />
            <NextTopLoader
              color="#550EFB"
              height={3}
              showSpinner={true}
              speed={200}
              shadow="0 0 10px #2299DD,0 0 5px #2299DD"
            />
            <ToastContainer/>
            {children}
          </div>
        </RootProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default LayoutWrapper;
