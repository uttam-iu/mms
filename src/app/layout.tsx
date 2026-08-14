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
      <body className="h-full flex flex-col overflow-hidden">
        <AppProvider>
          {isLoggedIn ? (
            <SidebarProvider className="h-full overflow-hidden">
              <AppSidebar />
              <main className="flex flex-col flex-1 h-full min-w-0 w-full overflow-hidden">
                <div className="flex items-center gap-2 px-2 py-1 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <SidebarTrigger />
                </div>
                <div id="main-content" className="flex-1 overflow-y-auto min-w-0">
                  {children}
                </div>
              </main>
              <FloatingChatWindow />
            </SidebarProvider>
          ) : (
            <div className="min-h-screen bg-background">{children}</div>
          )}
          <ToastContainer position="bottom-center" />
        </AppProvider>
      </body>

    </html>
  );
}
