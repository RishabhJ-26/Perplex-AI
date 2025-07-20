import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider"
import AppSidebar from "../components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Perplex AI",
  description: "An intelligent AI assistant built to deliver accurate, real-time answers with a seamless user experience.",
};


export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" type="image/png" href="/logo.png" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />

            <Provider>
            </Provider>
            <main className="flex-1 min-h-screen h-full relative pb-16">
              {children}
            </main>
            <footer className="fixed bottom-0 left-0 w-full text-center py-4 text-gray-500 text-sm bg-white z-50 font-semibold border-t shadow-md md:ml-64 md:w-[calc(100%-16rem)]">
              Made by <span className="text-red-500">❤️</span> with <a target="_blank" className="text-blue-400" href="http://linkedin.com/in/rishabh-jain-enris">Rishabh Jain</a> 
            </footer>
          </SidebarProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
