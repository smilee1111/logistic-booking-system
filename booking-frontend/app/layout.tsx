import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Nav } from "@/components/Nav";
import { getCurrentUser } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lab & Equipment Booking",
  description: "Book lab rooms and equipment",
};

// Split out from RootLayout so it can sit inside its own Suspense boundary —
// a root layout's own awaited work can't be covered by app/loading.tsx (that
// only wraps {children}, not the layout itself), so without this split, a
// slow getCurrentUser() call (e.g. right after the multi-hop OAuth redirect)
// left the whole page blank with zero feedback until it resolved.
async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <AuthProvider initialUser={user}>
      <Nav />
      {children}
    </AuthProvider>
  );
}

function ShellLoading() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading…
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<ShellLoading />}>
          <AuthenticatedShell>{children}</AuthenticatedShell>
        </Suspense>
      </body>
    </html>
  );
}
