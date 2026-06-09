import { Link } from 'react-router-dom';
import { MAX_NAME_LENGTH } from '@shared/dtos';

import { DuckCanvas } from '@/components/duck/DuckCanvas';
import { PixelButton } from '@/components/duck/PixelButton';
import { SpeechBubble } from '@/components/duck/SpeechBubble';
import { StarField } from '@/components/duck/StarField';
import { StatusBar } from '@/components/duck/StatusBar';
import { Ticker } from '@/components/duck/Ticker';
import { FE_ROUTES } from '@/utils/constants';

import { useHome } from './useHome';

export function Home() {
  const {
    heroName,
    initials,
    greeting,
    quote,
    tickerItems,
    lastSeen,
    pondStatus,
    openCases,
    quackName,
    setQuackName,
    onQuackSubmit,
    isQuacking,
  } = useHome();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-duck-navy font-body text-foreground">
      <StarField />

      <nav className="relative z-10 flex items-center justify-between gap-2 border-b-[3px] border-duck-amber bg-card px-3 py-2 sm:gap-4 sm:px-6 sm:py-3">
        <span className="shrink-0 font-pixel text-[7px] tracking-widest text-duck-amber sm:text-[8px]">
          DET. QUACKSWORTH
        </span>
        <div className="flex min-w-0 items-center gap-2 sm:gap-3.5">
          <span className="flex min-w-0 items-center gap-2 text-base text-muted-foreground sm:text-lg">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded border-2 border-duck-amber bg-accent font-pixel text-[7px] text-duck-amber"
              aria-label={greeting}
              title={greeting}
            >
              {initials}
            </span>
            <span className="hidden min-w-0 truncate sm:inline">
              {greeting}
            </span>
          </span>
          <Link
            to={FE_ROUTES.LOGOUT}
            className="shrink-0 whitespace-nowrap rounded border-2 border-destructive px-2 py-1 font-pixel text-[7px] uppercase text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground sm:px-2.5 sm:py-1.5"
          >
            <span className="sm:hidden">[ OUT ]</span>
            <span className="hidden sm:inline">[ Logout ]</span>
          </Link>
        </div>
      </nav>

      <main className="relative z-[2] flex flex-1 flex-col-reverse items-center justify-between gap-8 px-8 pt-10 sm:flex-row sm:items-end sm:gap-4 sm:px-12">
        <div className="max-w-xs pb-4 text-center sm:pb-12 sm:text-left">
          <span className="mb-3.5 inline-block rounded-sm bg-duck-amber px-2.5 py-1 font-pixel text-[7px] text-primary-foreground">
            ACTIVE AGENT
          </span>
          <h1 className="mb-1.5 font-pixel text-[13px] leading-[1.9] text-duck-amber">
            WELCOME BACK,
            <br />
            <span className="text-cream">{heroName}.</span>
          </h1>
          <p className="mb-6 text-xl leading-snug text-muted-foreground">
            The pond missed you.
            <br />
            New cases are waiting.
          </p>
          <form onSubmit={onQuackSubmit} className="flex flex-col gap-2.5">
            <label
              htmlFor="quack-name"
              className="font-pixel text-[7px] uppercase tracking-wider text-duck-amber"
            >
              Send a quack
            </label>
            <input
              id="quack-name"
              type="text"
              value={quackName}
              onChange={(event) => setQuackName(event.target.value)}
              placeholder="Name (optional)"
              maxLength={MAX_NAME_LENGTH}
              autoComplete="off"
              className="rounded-md border-2 border-secondary bg-card px-3 py-2.5 text-base text-cream placeholder:text-muted-foreground/60 focus:border-duck-amber focus:outline-none"
            />
            <PixelButton
              type="submit"
              disabled={isQuacking}
              className="w-auto px-3.5 py-2.5 text-[7px]"
            >
              {isQuacking ? '[ Quacking... ]' : '[ Quack! ]'}
            </PixelButton>
          </form>
        </div>

        <div className="relative flex flex-col items-center sm:flex-row sm:items-start">
          <SpeechBubble
            lines={quote}
            className="mb-2 w-44 sm:mb-0 sm:mr-2 sm:mt-2"
          />
          <img
            src="/images/detective-duck.png"
            alt="Det. Quacksworth, a pixel-art detective duck, tipping a hat"
            width={200}
            className="pixelated block w-44 animate-bob sm:w-52"
          />
        </div>
      </main>

      <div className="relative z-[3] h-16 shrink-0 border-t-4 border-grass-green bg-[#2d5a1b]">
        <div
          className="absolute inset-x-0 -top-2 h-2"
          style={{
            background:
              'repeating-linear-gradient(90deg,#4a9429 0px,#4a9429 16px,#3a7a1b 16px,#3a7a1b 32px)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-full">
          <DuckCanvas mode="both" height={64} />
        </div>
      </div>

      <div className="relative z-10">
        <StatusBar
          pondStatus={pondStatus}
          lastSeen={lastSeen}
          openCases={openCases}
        />
        <Ticker items={tickerItems} />
      </div>
    </div>
  );
}

export default Home;
