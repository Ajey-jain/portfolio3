import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  RotateCcw,
  ShieldCheck,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { Certificate } from '../types/portfolio';
import { apiUrl } from '../utils/api';
import { sanitizeExternalUrl } from '../utils/portfolioLogic';
import { PdfCanvasPreview } from './PdfCanvasPreview';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export function CertificateModal({ certificate, onClose }: CertificateModalProps) {
  const [zoom, setZoom] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(1);

  useEffect(() => {
    setZoom(1);
    setPageNumber(1);
    setNumPages(1);
  }, [certificate]);

  useEffect(() => {
    if (!certificate) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [certificate, onClose]);

  if (!certificate) return null;

  const isPdf = certificate.fileType.toLowerCase() === 'pdf';
  const fileStreamUrl = apiUrl(`/api/certificates/${certificate.id}/file`);
  const downloadUrl = apiUrl(`/api/certificates/${certificate.id}/file?download=1`);
  const safeVerifyUrl = sanitizeExternalUrl(certificate.verificationUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-modal-title"
    >
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#11131A] shadow-2xl">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#A0A4B0]">
              <span className="text-[#4788FF]">{certificate.category}</span>
              <span aria-hidden="true">·</span>
              <span>{certificate.issuingOrganization}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{certificate.issueDate}</span>
            </div>
            <h3 id="cert-modal-title" className="mt-1 truncate font-display text-lg font-bold text-white">
              {certificate.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPdf && numPages > 1 && (
              <div className="flex items-center rounded-lg border border-white/10 bg-[#08090D] p-1">
                <button
                  type="button"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="flex h-8 w-8 items-center justify-center rounded text-[#A0A4B0] hover:bg-white/5 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 font-mono text-xs text-white tabular-nums">
                  {pageNumber}/{numPages}
                </span>
                <button
                  type="button"
                  disabled={pageNumber >= numPages}
                  onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                  aria-label="Next page"
                  className="flex h-8 w-8 items-center justify-center rounded text-[#A0A4B0] hover:bg-white/5 hover:text-white disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex items-center rounded-lg border border-white/10 bg-[#08090D] p-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(2))))}
                aria-label="Zoom out certificate"
                className="flex h-8 w-8 items-center justify-center rounded text-[#A0A4B0] hover:bg-white/5 hover:text-white"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="min-w-[48px] text-center font-mono text-xs text-white tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.2).toFixed(2))))}
                aria-label="Zoom in certificate"
                className="flex h-8 w-8 items-center justify-center rounded text-[#A0A4B0] hover:bg-white/5 hover:text-white"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                aria-label="Reset zoom"
                className="flex h-8 w-8 items-center justify-center rounded text-[#A0A4B0] hover:bg-white/5 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            <a
              href={downloadUrl}
              download
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#4788FF] px-3.5 text-xs font-semibold text-white hover:bg-[#3A77EB] whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Download</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close certificate viewer"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#08090D] text-[#A0A4B0] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewer Viewport */}
        <div className="flex-1 overflow-auto bg-[#08090D] p-4 sm:p-6">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
            {isPdf ? (
              <div className="w-full overflow-auto rounded-xl border border-white/10 bg-white shadow-2xl">
                <PdfCanvasPreview
                  url={fileStreamUrl}
                  title={certificate.title}
                  scale={zoom}
                  pageNumber={pageNumber}
                  onNumPages={setNumPages}
                  className="min-h-[380px]"
                />
              </div>
            ) : (
              <img
                src={fileStreamUrl}
                alt={certificate.title}
                referrerPolicy="no-referrer"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                className="max-h-[65vh] w-auto rounded-xl border border-white/10 object-contain shadow-xl transition-transform duration-150"
              />
            )}
          </div>
        </div>

        {/* Extracted Metadata Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] bg-[#11131A] px-5 py-3.5 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#A0A4B0]">
            <span>
              Recipient: <strong className="text-white">{certificate.recipientName}</strong>
            </span>
            <span>
              Certificate ID:{' '}
              <strong className="font-mono text-white tabular-nums">{certificate.certificateId}</strong>
            </span>
            {certificate.skills.length > 0 && (
              <span>
                Skills: <strong className="text-white">{certificate.skills.join(', ')}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {safeVerifyUrl ? (
              <a
                href={safeVerifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-[#4788FF] hover:underline"
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Verify Credential</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[#A0A4B0]">
                <FileText className="h-3.5 w-3.5 text-[#9366FF]" aria-hidden="true" />
                <span>{certificate.verificationNote || 'Original uploaded document'}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
