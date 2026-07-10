import { DemoBanner } from "@/components/ui/DemoBanner";
import { boundaries, howItWorks, site } from "@/content/site";
import { publicEnv } from "@/lib/env";

export default function Home() {
  const botUrl = `https://t.me/${publicEnv.NEXT_PUBLIC_BOT_USERNAME}`;

  return (
    <>
      <DemoBanner />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {site.name}
        </h1>
        <p className="text-muted mt-3 text-xl">{site.tagline}</p>
        <p className="mt-6 max-w-xl text-lg">{site.description}</p>

        <a
          href={botUrl}
          className="rounded-base bg-button text-on-button mt-8 inline-flex min-h-11 items-center px-6 font-medium"
        >
          Открыть в Telegram
        </a>

        <h2 className="mt-16 text-2xl font-semibold">Как это работает</h2>
        <ol className="mt-6 space-y-5">
          {howItWorks.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden
                className="bg-amber/20 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-muted mt-1">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mt-16 text-2xl font-semibold">Чего мы не делаем</h2>
        <ul className="text-muted mt-6 space-y-3">
          {boundaries.map((line) => (
            <li key={line} className="border-line border-l-2 pl-4">
              {line}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
