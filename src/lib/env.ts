import { z } from "zod";

/**
 * Переменные окружения валидируются на старте: приложение падает на билде,
 * а не в рантайме на проде при отсутствующем токене.
 *
 * Публичные (`NEXT_PUBLIC_`) инлайнятся в клиентский бандл на этапе сборки,
 * поэтому обращаться к ним нужно по полному имени, а не через `process.env[key]`.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_BOT_USERNAME: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_YM_ID: z
    .string()
    .regex(/^\d*$/, "Номер счётчика Метрики — только цифры")
    .optional(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().regex(/^\d+:[\w-]+$/, "Формат: 123456:AA..."),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(16, "Минимум 16 символов"),
  SESSION_SECRET: z.string().min(32, "Минимум 32 байта"),
  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

function parse<T extends z.ZodType>(
  schema: T,
  source: unknown,
  scope: string,
): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Некорректные переменные окружения (${scope}):\n${issues}`);
  }
  return result.data;
}

export const publicEnv = parse(
  publicSchema,
  {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_BOT_USERNAME: process.env.NEXT_PUBLIC_BOT_USERNAME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_YM_ID: process.env.NEXT_PUBLIC_YM_ID || undefined,
  },
  "публичные",
);

/**
 * Читается только в серверном коде. Ленивая проверка: модуль импортируется и
 * клиентскими компонентами ради `publicEnv`, а серверных переменных там нет.
 */
let serverEnvCache: z.infer<typeof serverSchema> | null = null;

export function serverEnv(): z.infer<typeof serverSchema> {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() вызван на клиенте");
  }
  serverEnvCache ??= parse(
    serverSchema,
    {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET,
      SESSION_SECRET: process.env.SESSION_SECRET,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || undefined,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
    },
    "серверные",
  );
  return serverEnvCache;
}
