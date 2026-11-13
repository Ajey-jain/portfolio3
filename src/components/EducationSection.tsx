import { BookOpen, GraduationCap, Languages } from 'lucide-react';
import { motion } from 'motion/react';
import type { ProfileSettings } from '../types/portfolio';

interface EducationSectionProps {
  profile: ProfileSettings;
}

export function EducationSection({ profile }: EducationSectionProps) {
  const milestones = [
    {
      title: 'B.Tech CSE (AI & ML)',
      institution: profile.university,
      period: `Current Status: Second Year · Expected Graduation: ${profile.expectedGraduation}`,
      scoreLabel: 'SGPA',
      scoreValue: profile.sgpa,
      note: 'Specializing in Artificial Intelligence, Machine Learning, and AI Security fundamentals.',
      current: true,
    },
    {
      title: 'Class XII — CBSE',
      institution: 'Nalanda International Public School',
      period: '2025',
      scoreLabel: 'Percentage',
      scoreValue: '80.8%',
      note: 'Higher secondary foundation in Mathematics, Physics, and Computer Science.',
      current: false,
    },
    {
      title: 'Class X — CBSE',
      institution: 'Nalanda International Public School',
      period: '2023',
      scoreLabel: 'Percentage',
      scoreValue: '77.8%',
      note: 'Secondary school graduation.',
      current: false,
    },
  ];

  return (
    <section id="education" className="border-t border-white/[0.06] py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Animated Vertical Timeline */}
          <div className="lg:col-span-8">
            <p className="text-xs font-medium tracking-wide text-[#4788FF]">Education</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              My Academic Journey.
            </h2>

            <div className="relative mt-10 pl-8">
              {/* Vertical rail */}
              <div
                className="absolute top-2 bottom-2 left-3 w-px bg-gradient-to-b from-[#4788FF] via-[#9366FF]/60 to-white/10"
                aria-hidden="true"
              />

              <div className="space-y-8">
                {milestones.map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="relative rounded-2xl border border-white/[0.08] bg-[#11131A] p-6"
                  >
                    {/* Timeline node */}
                    <span
                      className={`absolute top-7 -left-[25px] flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 ${
                        item.current
                          ? 'border-[#4788FF] bg-[#08090D]'
                          : 'border-white/30 bg-[#08090D]'
                      }`}
                      aria-hidden="true"
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#A0A4B0]">
                          {item.current ? (
                            <GraduationCap className="h-4 w-4 text-[#4788FF]" aria-hidden="true" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-[#9366FF]" aria-hidden="true" />
                          )}
                          <span>{item.institution}</span>
                        </div>
                        <h3 className="mt-1.5 font-display text-lg font-bold text-white">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs text-[#A0A4B0]">{item.period}</p>
                      </div>

                      <div className="shrink-0 rounded-xl border border-white/10 bg-[#08090D] px-4 py-2 text-left sm:text-right">
                        <p className="text-[11px] font-medium text-[#A0A4B0]">{item.scoreLabel}</p>
                        <p className="font-mono text-lg font-bold text-white tabular-nums">
                          {item.scoreValue}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-[#A0A4B0]">{item.note}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Languages Spoken */}
          <div className="lg:col-span-4">
            <p className="text-xs font-medium tracking-wide text-[#9366FF]">Communication</p>
            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-white">
              Languages
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#A0A4B0]">
              Fluent across regional and technical communication environments.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2">
              {profile.languages.map((lang, idx) => (
                <motion.div
                  key={lang}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#11131A] p-4"
                >
                  <Languages className="h-4 w-4 shrink-0 text-[#4788FF]" aria-hidden="true" />
                  <span className="font-display text-sm font-semibold text-white">{lang}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
