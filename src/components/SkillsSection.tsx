import { motion } from 'motion/react';
import { Code2, Database, Globe } from 'lucide-react';

interface SkillItem {
  name: string;
  detail: string;
  symbol: string;
  accent: string;
}

const PROGRAMMING_SKILLS: SkillItem[] = [
  { name: 'Python', detail: 'Scripting, voice automation & AI exploration', symbol: 'Py', accent: '#4788FF' },
  { name: 'Java', detail: 'Object-oriented programming fundamentals', symbol: 'Jv', accent: '#9366FF' },
  { name: 'C', detail: 'Procedural logic & memory concepts', symbol: 'C', accent: '#4788FF' },
  { name: 'C++', detail: 'Structured programming & algorithms', symbol: 'C++', accent: '#9366FF' },
  { name: 'JavaScript', detail: 'Interactive web logic & browser APIs', symbol: 'JS', accent: '#4788FF' },
];

const DATABASE_SKILLS: SkillItem[] = [
  { name: 'MySQL', detail: 'Relational schemas, querying & data integrity', symbol: 'SQL', accent: '#4788FF' },
];

const WEB_SKILLS: SkillItem[] = [
  {
    name: 'Full Stack Web Development',
    detail: 'In Progress — React, TypeScript & RESTful backend architectures',
    symbol: 'FS',
    accent: '#9366FF',
  },
];

export function SkillsSection() {
  return (
    <section id="skills" className="border-t border-white/[0.06] py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-12">
          <p className="text-xs font-medium tracking-wide text-[#4788FF]">Technical Skills</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            My Technical Arsenal.
          </h2>
          <p className="mt-3 max-w-2xl text-base text-[#A0A4B0]">
            Core languages, relational data tooling, and full-stack engineering foundations I am building through
            coursework and practical projects.
          </p>
        </div>

        <div className="space-y-10">
          {/* Programming */}
          <div>
            <div className="mb-4 flex items-center gap-2.5 text-sm font-semibold text-white">
              <Code2 className="h-4 w-4 text-[#4788FF]" aria-hidden="true" />
              <h3>Programming</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {PROGRAMMING_SKILLS.map((skill, idx) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className="group rounded-xl border border-white/[0.08] bg-[#11131A] p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-white/20"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#08090D] font-mono text-xs font-semibold"
                    style={{ color: skill.accent }}
                  >
                    {skill.symbol}
                  </div>
                  <h4 className="mt-4 font-display text-base font-semibold text-white">{skill.name}</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#A0A4B0]">{skill.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Database & Web Development Split */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-2.5 text-sm font-semibold text-white">
                <Database className="h-4 w-4 text-[#4788FF]" aria-hidden="true" />
                <h3>Database</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {DATABASE_SKILLS.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-start gap-4 rounded-xl border border-white/[0.08] bg-[#11131A] p-5 transition-colors hover:border-white/20"
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#08090D] font-mono text-xs font-semibold"
                      style={{ color: skill.accent }}
                    >
                      {skill.symbol}
                    </div>
                    <div>
                      <h4 className="font-display text-base font-semibold text-white">{skill.name}</h4>
                      <p className="mt-1 text-sm text-[#A0A4B0]">{skill.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-2.5 text-sm font-semibold text-white">
                <Globe className="h-4 w-4 text-[#9366FF]" aria-hidden="true" />
                <h3>Web Development</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {WEB_SKILLS.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-start gap-4 rounded-xl border border-white/[0.08] bg-[#11131A] p-5 transition-colors hover:border-white/20"
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#08090D] font-mono text-xs font-semibold"
                      style={{ color: skill.accent }}
                    >
                      {skill.symbol}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-display text-base font-semibold text-white">{skill.name}</h4>
                        <span className="text-xs font-medium text-[#9366FF]">· In Progress</span>
                      </div>
                      <p className="mt-1 text-sm text-[#A0A4B0]">{skill.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
