import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Code2, ExternalLink, Mic, X } from 'lucide-react';
import { motion } from 'motion/react';
import jarvisIllustration from '../assets/images/jarvis_voice_assistant_1794563508136.jpg';
import type { Project } from '../types/portfolio';
import { sanitizeExternalUrl } from '../utils/portfolioLogic';

interface ProjectsSectionProps {
  projects: Project[];
  onProjectInteract: (slug: string) => void;
  onOpenAdmin?: () => void;
}

function resolveProjectImage(imageUrl: string): string {
  if (!imageUrl || imageUrl.includes('jarvis_voice_assistant')) {
    return jarvisIllustration;
  }
  return imageUrl;
}

export function ProjectsSection({ projects, onProjectInteract }: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [repoNotice, setRepoNotice] = useState<string | null>(null);

  const openDetails = (project: Project) => {
    onProjectInteract(project.slug);
    setRepoNotice(null);
    setSelectedProject(project);
  };

  const handleGitHubClick = (project: Project) => {
    onProjectInteract(project.slug);
    const validUrl = sanitizeExternalUrl(project.githubUrl);
    if (validUrl) {
      window.open(validUrl, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedProject(project);
      setRepoNotice(
        'GitHub repository URL is not linked yet. You can attach the public repository URL anytime from the Admin Portal.'
      );
    }
  };

  return (
    <section id="projects" className="border-t border-white/[0.06] py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#4788FF]">Projects</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Things I&apos;ve Built.
            </h2>
          </div>
          <p className="text-sm text-[#A0A4B0]">
            Verified builds documented with real implementation scope.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#11131A] p-10 text-center text-sm text-[#A0A4B0]">
            No published projects yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {projects.map((project) => {
              const validGithub = sanitizeExternalUrl(project.githubUrl);
              const validLive = sanitizeExternalUrl(project.liveUrl);

              return (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45 }}
                  className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#11131A]"
                >
                  <div className="grid grid-cols-1 items-stretch lg:grid-cols-12">
                    {/* Project Visual */}
                    <div className="relative min-h-[260px] overflow-hidden bg-[#0B0D13] lg:col-span-6">
                      <img
                        src={resolveProjectImage(project.imageUrl)}
                        alt={`${project.title} architecture visualization`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#11131A]/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#11131A]/40" />
                    </div>

                    {/* Project Details */}
                    <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-6">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#A0A4B0]">
                          <Mic className="h-3.5 w-3.5 text-[#4788FF]" aria-hidden="true" />
                          <span>{project.category}</span>
                          {project.featured && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#9366FF]">Featured Build</span>
                            </>
                          )}
                        </div>

                        <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-white">
                          {project.title}
                        </h3>

                        <p className="mt-3 text-sm leading-relaxed text-[#A0A4B0] sm:text-base">
                          {project.description}
                        </p>

                        {project.highlights.length > 0 && (
                          <div className="mt-5">
                            <p className="text-xs font-medium text-white/80">Core Capabilities</p>
                            <ul className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {project.highlights.map((item) => (
                                <li key={item} className="flex items-center gap-2 text-xs text-[#A0A4B0]">
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#4788FF]" aria-hidden="true" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/[0.06] pt-4 text-xs font-mono text-[#A0A4B0]">
                          {project.technologies.map((tech, idx) => (
                            <span key={tech} className="inline-flex items-center gap-2">
                              {idx > 0 && <span aria-hidden="true" className="text-white/25">/</span>}
                              <span className="text-white/90">{tech}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-7 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openDetails(project)}
                          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#4788FF] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3A77EB] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4788FF]"
                        >
                          <span>Inspect Project Details</span>
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleGitHubClick(project)}
                          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-white/15 bg-[#08090D] px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-white/30 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4788FF]"
                        >
                          <Code2 className="h-3.5 w-3.5 text-[#A0A4B0]" aria-hidden="true" />
                          <span>{validGithub ? 'GitHub Repository' : 'Repository Info'}</span>
                        </button>

                        {validLive && (
                          <a
                            href={validLive}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-medium text-[#A0A4B0] hover:text-white"
                          >
                            <span>Live Demo</span>
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Project Details Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#11131A] p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              aria-label="Close project details"
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#08090D] text-[#A0A4B0] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="text-xs font-medium text-[#4788FF]">{selectedProject.category}</p>
            <h3 id="project-modal-title" className="mt-2 font-display text-2xl font-bold text-white">
              {selectedProject.title}
            </h3>

            <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#08090D]">
              <img
                src={resolveProjectImage(selectedProject.imageUrl)}
                alt={selectedProject.title}
                referrerPolicy="no-referrer"
                className="aspect-video w-full object-cover"
              />
            </div>

            <p className="mt-5 text-sm leading-relaxed text-[#A0A4B0]">
              {selectedProject.description}
            </p>

            {repoNotice && (
              <div className="mt-4 rounded-lg border border-[#4788FF]/30 bg-[#4788FF]/10 p-3.5 text-xs text-white/90">
                {repoNotice}
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.08] bg-[#08090D] p-4">
                <p className="text-xs font-medium text-white">Architecture Highlights</p>
                <ul className="mt-2.5 space-y-2">
                  {selectedProject.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-xs text-[#A0A4B0]">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#4788FF]" aria-hidden="true" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#08090D] p-4">
                <p className="text-xs font-medium text-white">Technology Stack</p>
                <p className="mt-2.5 font-mono text-xs leading-relaxed text-[#A0A4B0]">
                  {selectedProject.technologies.join(' · ')}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {sanitizeExternalUrl(selectedProject.githubUrl) && (
                <a
                  href={sanitizeExternalUrl(selectedProject.githubUrl)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#4788FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3A77EB]"
                >
                  <span>Open GitHub Repository</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
