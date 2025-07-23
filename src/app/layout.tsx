import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UserProvider } from "@/context/UserContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { headers } from "next/headers";

import "./globals.css";
import { cookies } from "next/headers";
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
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const origin = `${protocol}://${host}`;

  const session = (await cookies()).get("session")?.value;

  const res = await fetch(`${origin}/api/auth/me`, {
    method: "GET",
    headers: {
      Cookie: session ? `session=${session}` : "",
    },
  });
  const data = await res.json();
  const email: string | null = data?.email;
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} text-stone-950 bg-stone-100`}>
        <NotificationProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            <UserProvider>{children}</UserProvider>
          </ThemeProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
