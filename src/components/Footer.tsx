import { Download, Lock } from 'lucide-react';
import type { ProfileSettings } from '../types/portfolio';
import { apiUrl } from '../utils/api';

interface FooterProps {
  profile: ProfileSettings;
  onOpenAdmin: () => void;
}

export function Footer({ profile, onOpenAdmin }: FooterProps) {
  return (
    <footer className="border-t border-white/[0.08] bg-[#08090D] py-10">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-[#11131A] text-[11px] font-bold text-white">
              AC
            </span>
            <span className="font-display text-sm font-semibold text-white">{profile.name}</span>
          </div>
          <p className="mt-2 text-xs text-[#A0A4B0]">
            Aspiring AI Security Engineer · {profile.university} · {profile.location}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <a
            href={apiUrl('/api/resume/download')}
            download="Ajey_C_Resume.pdf"
            className="inline-flex items-center gap-1.5 text-[#A0A4B0] transition-colors hover:text-white"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Resume PDF</span>
          </a>

          <span aria-hidden="true" className="text-white/20">
            ·
          </span>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 text-[#A0A4B0] transition-colors hover:text-white"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Admin Portal</span>
          </button>

          <span aria-hidden="true" className="text-white/20">
            ·
          </span>

          <span className="text-[#A0A4B0]">© {new Date().getFullYear()} {profile.name}</span>
        </div>
      </div>
    </footer>
  );
}
