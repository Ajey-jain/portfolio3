import { useState } from 'react';
import { Download, Menu, X } from 'lucide-react';
import { apiUrl } from '../utils/api';

interface NavbarProps {
  onNavigateSection: (sectionId: string) => void;
}

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'education', label: 'Education' },
  { id: 'research', label: 'Research' },
  { id: 'contact', label: 'Contact' },
];

export function Navbar({ onNavigateSection }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setMobileOpen(false);
    onNavigateSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.08] bg-[#08090D]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-8 px-4 sm:px-6">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('home');
          }}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4788FF] rounded-md"
          aria-label="Ajey C Home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#11131A] text-xs font-bold tracking-wider text-white">
            AC
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-white">
            Ajey C
          </span>
        </a>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5" aria-label="Primary Navigation">
          {NAV_LINKS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.id);
              }}
              className="text-sm font-medium text-[#A0A4B0] transition-colors duration-150 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4788FF] rounded px-1 py-1"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={apiUrl('/api/resume/download')}
            download="Ajey_C_Resume.pdf"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#4788FF] px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#3A77EB] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4788FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090D]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download Resume</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#11131A] text-white lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4788FF]"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/[0.08] bg-[#08090D]/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-[1200px] flex-col gap-1 px-4 py-4" aria-label="Mobile Navigation">
            {NAV_LINKS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
                className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-[#A0A4B0] transition-colors hover:bg-[#11131A] hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <a
              href={apiUrl('/api/resume/download')}
              download="Ajey_C_Resume.pdf"
              className="mt-2 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#4788FF] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Download Resume</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
