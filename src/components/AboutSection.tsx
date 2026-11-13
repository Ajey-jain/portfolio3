import { Award, GraduationCap, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import type { ProfileSettings } from '../types/portfolio';

interface AboutSectionProps {
  profile: ProfileSettings;
}

export function AboutSection({ profile }: AboutSectionProps) {
  return (
    <section id="about" className="border-t border-white/[0.06] py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-12">
          <p className="text-xs font-medium tracking-wide text-[#4788FF]">About Me</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Beyond the Code.
          </h2>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Portrait Frame */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-4"
          >
            <div className="h-full overflow-hidden rounded-2xl border border-white/[0.1] bg-[#11131A] p-3">
              <div className="relative aspect-[4/5] h-full w-full overflow-hidden rounded-xl bg-[#0D0F15]">
                <img
                  src={profile.photoPath}
                  alt={`${profile.name} portrait`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#08090D]/80 to-transparent" />
              </div>
            </div>
          </motion.div>

          {/* Narrative + 3 Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="flex flex-col justify-between gap-8 lg:col-span-8"
          >
            <div className="space-y-4 text-base leading-relaxed text-[#A0A4B0] sm:text-lg">
              <p>
                I&apos;m Ajey, a second-year Computer Science engineering student at{' '}
                <span className="font-medium text-white">{profile.university}</span>, specializing in Artificial
                Intelligence and Machine Learning.
              </p>
              <p>
                I enjoy exploring technology, developing software solutions, and understanding how artificial
                intelligence can become safer and more reliable.
              </p>
              <p>
                Currently, I&apos;m strengthening my programming fundamentals, exploring AI security, and building
                practical projects.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#11131A]/70 p-5">
              <p className="text-xs font-medium text-[#9366FF]">Career Objective</p>
              <p className="mt-2 text-sm leading-relaxed text-[#A0A4B0]">
                {profile.careerObjective}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.08] bg-[#11131A] p-5 transition-colors hover:border-white/20">
                <GraduationCap className="h-5 w-5 text-[#4788FF]" aria-hidden="true" />
                <p className="mt-3 text-xs text-[#A0A4B0]">Education</p>
                <p className="mt-1 font-display text-base font-semibold text-white">
                  {profile.university}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#11131A] p-5 transition-colors hover:border-white/20">
                <Award className="h-5 w-5 text-[#9366FF]" aria-hidden="true" />
                <p className="mt-3 text-xs text-[#A0A4B0]">Academic Performance</p>
                <p className="mt-1 font-mono text-base font-semibold text-white tabular-nums">
                  {profile.sgpa} SGPA
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#11131A] p-5 transition-colors hover:border-white/20">
                <ShieldCheck className="h-5 w-5 text-[#4788FF]" aria-hidden="true" />
                <p className="mt-3 text-xs text-[#A0A4B0]">Career Interest</p>
                <p className="mt-1 font-display text-base font-semibold text-white">
                  AI Security
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
