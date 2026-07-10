/**
 * Склейка классов. Без clsx и tailwind-merge: в этом проекте нет ни одного
 * места, где классы конфликтуют по одному и тому же свойству, а лишняя
 * зависимость в бандл Mini App не окупается.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
