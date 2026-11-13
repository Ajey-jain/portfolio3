import { useState, type FormEvent } from 'react';
import { Check, Copy, ExternalLink, Mail, MapPin, Phone, Send } from 'lucide-react';
import type { ProfileSettings } from '../types/portfolio';
import { apiFetch } from '../utils/api';
import { sanitizeExternalUrl, validateContactInput } from '../utils/portfolioLogic';

interface ContactSectionProps {
  profile: ProfileSettings;
  onOpenAdmin: () => void;
}

export function ContactSection({ profile, onOpenAdmin }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const githubUrl = sanitizeExternalUrl(profile.githubUrl);
  const linkedinUrl = sanitizeExternalUrl(profile.linkedinUrl);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      setCopiedEmail(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const check = validateContactInput({ name, email, subject, message, website });
    if (!check.valid && !check.isSpam) {
      setErrors(check.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await apiFetch<{ success: boolean; message: string }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, subject, message, website }),
      });
      setStatusMessage({ type: 'success', text: res.message });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to send message right now.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="border-t border-white/[0.06] py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column: Direct Details & Links */}
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-wide text-[#4788FF]">Contact</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Let&apos;s Build Something Together.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#A0A4B0]">
              Have an interesting idea, opportunity, or project? I&apos;d love to connect.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#11131A] p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="h-4 w-4 shrink-0 text-[#4788FF]" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#A0A4B0]">Email</p>
                    <p className="truncate text-sm font-medium text-white">{profile.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label="Copy email address"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-[#08090D] px-3 text-xs font-medium text-white hover:border-white/25 whitespace-nowrap shrink-0"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-[#A0A4B0]" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#11131A] p-4">
                <Phone className="h-4 w-4 shrink-0 text-[#9366FF]" aria-hidden="true" />
                <div>
                  <p className="text-xs text-[#A0A4B0]">Phone</p>
                  <p className="font-mono text-sm font-medium text-white tabular-nums">{profile.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#11131A] p-4">
                <MapPin className="h-4 w-4 shrink-0 text-[#4788FF]" aria-hidden="true" />
                <div>
                  <p className="text-xs text-[#A0A4B0]">Location</p>
                  <p className="text-sm font-medium text-white">{profile.location}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#4788FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3A77EB]"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Email Directly</span>
              </a>

              {githubUrl ? (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 bg-[#11131A] px-4 py-2 text-xs font-semibold text-white hover:border-white/30"
                >
                  <span>GitHub</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 bg-[#11131A] px-4 py-2 text-xs font-medium text-[#A0A4B0] hover:text-white"
                >
                  <span>GitHub (Add URL in Admin)</span>
                </button>
              )}

              {linkedinUrl ? (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 bg-[#11131A] px-4 py-2 text-xs font-semibold text-white hover:border-white/30"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 bg-[#11131A] px-4 py-2 text-xs font-medium text-[#A0A4B0] hover:text-white"
                >
                  <span>LinkedIn (Add URL in Admin)</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Validated Contact Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl border border-white/[0.1] bg-[#11131A] p-6 sm:p-8"
            >
              {/* Honeypot field hidden from real users */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-medium text-[#A0A4B0]">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.1] bg-[#08090D] px-3.5 text-sm text-white placeholder-[#A0A4B0]/50 focus:border-[#4788FF] focus:outline-none"
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-rose-400">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-medium text-[#A0A4B0]">
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.1] bg-[#08090D] px-3.5 text-sm text-white placeholder-[#A0A4B0]/50 focus:border-[#4788FF] focus:outline-none"
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-rose-400">{errors.email}</p>}
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="contact-subject" className="block text-xs font-medium text-[#A0A4B0]">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Internship opportunity / Project collaboration"
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.1] bg-[#08090D] px-3.5 text-sm text-white placeholder-[#A0A4B0]/50 focus:border-[#4788FF] focus:outline-none"
                />
                {errors.subject && <p className="mt-1.5 text-xs text-rose-400">{errors.subject}</p>}
              </div>

              <div className="mt-5">
                <label htmlFor="contact-message" className="block text-xs font-medium text-[#A0A4B0]">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details about the opportunity or project..."
                  className="mt-2 w-full rounded-xl border border-white/[0.1] bg-[#08090D] p-3.5 text-sm text-white placeholder-[#A0A4B0]/50 focus:border-[#4788FF] focus:outline-none"
                />
                {errors.message && <p className="mt-1.5 text-xs text-rose-400">{errors.message}</p>}
              </div>

              {statusMessage && (
                <div
                  role="status"
                  className={`mt-5 rounded-xl border p-3.5 text-xs font-medium ${
                    statusMessage.type === 'success'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}

              <div className="mt-6 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#4788FF] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3A77EB] disabled:opacity-60"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
