import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import Header from "@/components/Header";
import NextAuthProvider from "@/components/auth/AuthProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SorteaGo - Gestión de Rifas",
  description: "Plataforma para gestionar rifas y sorteos de cualquier tipo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NextAuthProvider>
          <AuthProvider>
            <Header />
            <main>
              {children}
            </main>
            <AuthModal />
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
