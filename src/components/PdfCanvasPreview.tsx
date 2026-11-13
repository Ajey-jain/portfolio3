import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentLoadingTask } from 'pdfjs-dist';
import { FileText } from 'lucide-react';

interface PdfCanvasPreviewProps {
  url: string;
  title: string;
  scale?: number;
  pageNumber?: number;
  onNumPages?: (count: number) => void;
  className?: string;
}

export function PdfCanvasPreview({
  url,
  title,
  scale = 1,
  pageNumber = 1,
  onNumPages,
  className = '',
}: PdfCanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;

    async function renderPdf() {
      setStatus('loading');
      try {
        const [pdfjsLib, workerMod] = await Promise.all([
          import('pdfjs-dist'),
          import('pdfjs-dist/build/pdf.worker.mjs?url'),
        ]);
        if (cancelled) return;
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerMod.default;
        }
        loadingTask = pdfjsLib.getDocument({ url });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        onNumPages?.(pdf.numPages);
        const safePage = Math.min(Math.max(1, pageNumber), pdf.numPages);
        const page = await pdf.getPage(safePage);
        if (cancelled) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const containerWidth = container.clientWidth || 420;
        const fitScale = (containerWidth / baseViewport.width) * scale;
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: fitScale * outputScale });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width / outputScale)}px`;
        canvas.style.height = `${Math.floor(viewport.height / outputScale)}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({
          canvasContext: ctx,
          viewport,
          canvas,
        }).promise;

        if (!cancelled) {
          setStatus('ready');
        }
      } catch (err) {
        if (!cancelled) {
          console.error('PDF render error:', err);
          setStatus('error');
        }
      }
    }

    void renderPdf();

    return () => {
      cancelled = true;
      if (loadingTask) {
        void loadingTask.destroy();
      }
    };
  }, [url, scale, pageNumber, onNumPages]);

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-white ${className}`}
    >
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0D13] text-xs text-[#A0A4B0]">
          <FileText className="h-6 w-6 text-[#4788FF] animate-pulse" aria-hidden="true" />
          <span className="mt-2">Rendering certificate...</span>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0D13] p-4 text-center text-xs text-[#A0A4B0]">
          <FileText className="h-7 w-7 text-[#9366FF]" aria-hidden="true" />
          <p className="mt-2 font-medium text-white">{title}</p>
          <p className="mt-1">PDF document ready for download</p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        aria-label={`${title} PDF page ${pageNumber}`}
        className={`block max-w-full transition-opacity duration-150 ${
          status === 'ready' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
