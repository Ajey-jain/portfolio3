import { ArrowRight, Mail, Shield, Terminal, Cpu } from 'lucide-react';
import { motion } from 'motion/react';
import type { ProfileSettings } from '../types/portfolio';

interface HeroSectionProps {
  profile: ProfileSettings;
  certificateCount: number;
  onExploreWork: () => void;
  onConnect: () => void;
}

export function HeroSection({
  profile,
  certificateCount,
  onExploreWork,
  onConnect,
}: HeroSectionProps) {
  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
      {/* Subtle architectural background mesh */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-[#4788FF]/[0.08] blur-[120px]" />
        <div className="absolute top-20 right-1/6 h-[380px] w-[380px] rounded-full bg-[#9366FF]/[0.07] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Typographic Hierarchy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center lg:col-span-7"
          >
            <div className="mb-5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium tracking-wide text-[#A0A4B0]">
              <span className="text-[#4788FF]">2nd Year B.Tech | AI &amp; ML</span>
              <span aria-hidden="true">·</span>
              <span>Open to Learning Opportunities</span>
            </div>

            <p className="mb-3 text-base font-medium text-white/90 sm:text-lg">
              Hi, I&apos;m {profile.name}.
            </p>

            <h1 className="font-display text-[clamp(2.25rem,4.4vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-white">
              {profile.headline}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#A0A4B0] sm:text-lg">
              {profile.subheadline}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onExploreWork}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#4788FF] px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#3A77EB] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4788FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090D]"
              >
                <span>Explore My Work</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onConnect}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/15 bg-[#11131A] px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:border-white/30 hover:bg-[#171A24] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4788FF]"
              >
                <Mail className="h-4 w-4 text-[#A0A4B0]" aria-hidden="true" />
                <span>Let&apos;s Connect</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Actual Personal Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center lg:col-span-5"
          >
            <div className="relative w-full max-w-[380px] lg:max-w-[400px]">
              {/* Subtle gradient hairline frame */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4788FF]/30 via-white/10 to-[#9366FF]/30 p-[1px] shadow-2xl">
                <div className="rounded-[15px] bg-[#11131A] p-3">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#0D0F15]">
                    <img
                      src={profile.photoPath}
                      alt={`${profile.name} — Computer Science & AI/ML Student`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-top"
                    />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/15" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#08090D]/90 via-[#08090D]/45 to-transparent" />
                    <div className="absolute inset-x-4 bottom-3.5 flex items-center justify-between gap-2 text-xs text-white">
                      <span className="font-medium">{profile.name}</span>
                      <span className="font-mono text-[#E0E4EC] tabular-nums">{profile.location}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 px-1 text-xs text-[#A0A4B0]">
                    <span className="inline-flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-[#4788FF]" aria-hidden="true" />
                      <span className="text-white/90 font-medium">AI Security Focus</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-[#9366FF]" aria-hidden="true" />
                      <span className="text-white/90 font-medium">Python &amp; ML</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Full-Width Key Academic & Credential Strip below Hero Split */}
        <div className="mt-14 grid grid-cols-2 gap-4 border-t border-b border-white/[0.08] py-6 sm:grid-cols-4 sm:gap-8">
          <div>
            <p className="text-xs text-[#A0A4B0]">University</p>
            <p className="mt-1 font-display text-lg font-semibold text-white">{profile.university}</p>
          </div>
          <div>
            <p className="text-xs text-[#A0A4B0]">Academic Performance</p>
            <p className="mt-1 font-mono text-lg font-semibold text-white tabular-nums">
              {profile.sgpa} <span className="font-sans text-sm font-normal text-[#4788FF]">SGPA</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-[#A0A4B0]">Current Status</p>
            <p className="mt-1 font-display text-lg font-semibold text-white tabular-nums">
              2nd Year <span className="text-sm font-normal text-[#A0A4B0]">({profile.expectedGraduation})</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-[#A0A4B0]">Verified Certificates</p>
            <p className="mt-1 flex items-center gap-2 font-mono text-lg font-semibold text-white tabular-nums">
              <span>{certificateCount}</span>
              <Cpu className="h-4 w-4 text-[#9366FF]" aria-hidden="true" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
