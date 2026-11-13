import { useMemo, useState } from 'react';
import { Download, Eye, FileText, Search } from 'lucide-react';
import { motion } from 'motion/react';
import type { Certificate, CertificateCategory } from '../types/portfolio';
import { apiUrl } from '../utils/api';
import { filterCertificates, getRelevantCertificateCategories } from '../utils/portfolioLogic';
import { CertificateModal } from './CertificateModal';
import { PdfCanvasPreview } from './PdfCanvasPreview';

interface CertificatesSectionProps {
  certificates: Certificate[];
  onCertificateView: (certId: number) => void;
}

export function CertificatesSection({ certificates, onCertificateView }: CertificatesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | CertificateCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);

  const relevantCategories = useMemo(
    () => getRelevantCertificateCategories(certificates),
    [certificates]
  );

  const filtered = useMemo(
    () => filterCertificates(certificates, selectedCategory, searchQuery),
    [certificates, selectedCategory, searchQuery]
  );

  const openModal = (cert: Certificate) => {
    onCertificateView(cert.id);
    setActiveCertificate(cert);
  };

  return (
    <section id="certificates" className="border-t border-white/[0.06] py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#4788FF]">Verified Credentials</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Certifications &amp; Achievements.
            </h2>
          </div>

          <p className="font-mono text-xs text-[#A0A4B0] tabular-nums" data-testid="certificate-counter">
            Showing <span className="font-semibold text-white">{filtered.length}</span> of{' '}
            <span className="font-semibold text-white">{certificates.length}</span> verified certificates
          </p>
        </div>

        {/* Category Filters & Search Controls */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#11131A] p-1.5"
            role="tablist"
            aria-label="Filter certificates by category"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'All'}
              onClick={() => setSelectedCategory('All')}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-[#4788FF] text-white'
                  : 'text-[#A0A4B0] hover:text-white'
              }`}
            >
              All ({certificates.length})
            </button>
            {relevantCategories.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === category
                    ? 'bg-[#4788FF] text-white'
                    : 'text-[#A0A4B0] hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#A0A4B0]"
              aria-hidden="true"
            />
            <label htmlFor="certificate-search" className="sr-only">
              Search certificates
            </label>
            <input
              id="certificate-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, issuer, skill, or ID..."
              className="h-11 w-full rounded-xl border border-white/[0.1] bg-[#11131A] pr-4 pl-10 text-sm text-white placeholder-[#A0A4B0]/70 focus:border-[#4788FF] focus:outline-none"
            />
          </div>
        </div>

        {/* Certificate Grid */}
        {filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#11131A] p-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-[#A0A4B0]" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-white">No certificates match your filter.</p>
            <p className="mt-1 text-xs text-[#A0A4B0]">
              Clear your search query or switch back to All categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/5"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((cert, idx) => {
              const isPdf = cert.fileType.toLowerCase() === 'pdf';
              const streamUrl = apiUrl(`/api/certificates/${cert.id}/file`);
              const downloadUrl = apiUrl(`/api/certificates/${cert.id}/file?download=1`);

              return (
                <motion.article
                  key={cert.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.09] bg-[#11131A] transition-colors hover:border-white/20"
                >
                  <div>
                    {/* Original Document Thumbnail Preview */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-white/[0.06] bg-[#0B0D13]">
                      {isPdf ? (
                        <PdfCanvasPreview url={streamUrl} title={cert.title} />
                      ) : (
                        <img
                          src={streamUrl}
                          alt={cert.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => openModal(cert)}
                        aria-label={`Open interactive viewer for ${cert.title}`}
                        className="absolute inset-0 bg-gradient-to-t from-[#08090D]/60 via-transparent to-transparent opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 flex items-end justify-end p-3"
                      >
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#08090D]/90 px-3 py-1.5 text-xs font-medium text-white border border-white/15">
                          <Eye className="h-3.5 w-3.5 text-[#4788FF]" aria-hidden="true" />
                          <span>Inspect Full Document</span>
                        </span>
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#A0A4B0]">
                        <span className="text-[#4788FF]">{cert.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{cert.issueYear}</span>
                      </div>

                      <h3 className="mt-2 font-display text-base font-semibold leading-snug text-white">
                        {cert.title}
                      </h3>

                      <p className="mt-1.5 text-xs text-[#A0A4B0]">{cert.issuingOrganization}</p>

                      <div className="mt-3 space-y-1 border-t border-white/[0.06] pt-3 text-xs text-[#A0A4B0]">
                        <p>
                          Issued: <span className="text-white/90">{cert.issueDate}</span>
                        </p>
                        <p>
                          ID:{' '}
                          <span className="font-mono text-white/90 tabular-nums">{cert.certificateId}</span>
                        </p>
                        {cert.needsVerification && (
                          <p className="text-amber-400">Flagged for manual verification</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 border-t border-white/[0.06] px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => openModal(cert)}
                      className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#4788FF] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3A77EB] whitespace-nowrap"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>View Certificate</span>
                    </button>

                    <a
                      href={downloadUrl}
                      download
                      aria-label={`Download ${cert.title}`}
                      className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-[#08090D] px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-white/30 whitespace-nowrap"
                    >
                      <Download className="h-3.5 w-3.5 text-[#A0A4B0]" aria-hidden="true" />
                      <span>Download</span>
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      <CertificateModal
        certificate={activeCertificate}
        onClose={() => setActiveCertificate(null)}
      />
    </section>
  );
}
