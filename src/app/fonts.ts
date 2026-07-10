import { Inter, JetBrains_Mono } from "next/font/google";

/** subsets с кириллицей обязателен: иначе браузер тянет латиницу и кириллицу
 *  отдельными файлами. */
export const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});
