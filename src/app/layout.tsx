import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UserProvider } from "@/context/UserContext";
import { getSession } from "./_lib/session";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PostPilot",
  description: "Automate your social media presence",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isLoggedIn = !!session;
  const email = session?.email ?? '';
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} text-stone-950 bg-stone-100`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <UserProvider isLoggedIn={isLoggedIn} email={email}>{children}</UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
