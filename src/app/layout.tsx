import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UserProvider } from "@/context/UserContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { headers } from "next/headers";
import "./globals.css";
// import SubLayout from "./subLayout";
import { cookies } from "next/headers";

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
      <head>
      <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
      </head>
      <body className={`text-stone-950 bg-stone-100 vsc-initialized`}>
        <NotificationProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            <UserProvider email={email}>
              {/* <SubLayout>{children}</SubLayout> */}
              {children}
            </UserProvider>
          </ThemeProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
