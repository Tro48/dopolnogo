import type { Metadata } from "next";
import { inter, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Стапель — фронтенд под ключ на React и Next.js",
  description:
    "Собираю то, что потом можно поддерживать. Лендинги, SPA и дашборды, интеграции и доработка чужого кода.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <div aria-hidden className="blueprint-grid" />
        {children}
      </body>
    </html>
  );
}
