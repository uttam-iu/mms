import type { Metadata } from "next";
import { Geist, Geist_Mono, Raleway } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { cookies } from "next/headers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import FloatingChatWindow from "@/components/FloatingChatWindow";
import { AppProvider } from "@/context/AppContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const raleway = Raleway({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MMS",
  description: "Manage Your Meal...",
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const isLoggedIn = !!token;

  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", raleway.variable)}
    >
      <body className="min-h-full flex flex-col overflow-hidden">
        <AppProvider>
          {isLoggedIn ?
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1 min-w-0 w-full overflow-x-hidden">
                <SidebarTrigger />
                <div id='main-content' className="overflow-auto p-1 min-w-0" style={{ height: `calc(100vh - 48px)` }}>
                  {children}
                </div>
              </main>
              <FloatingChatWindow />
            </SidebarProvider>
            : <div className="min-h-screen bg-background">{children}</div>}
          <ToastContainer position="bottom-center" />
        </AppProvider>
      </body>

    </html>
  );
}
