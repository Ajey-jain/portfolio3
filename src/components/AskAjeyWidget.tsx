import { useRef, useState, type FormEvent } from 'react';
import { MessageSquare, Minimize2, Send, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ChatTurn } from '../types/portfolio';
import { apiFetch } from '../utils/api';

const SUGGESTED_PROMPTS = [
  'Who is Ajey?',
  'What is his SGPA & education?',
  'What projects has he built?',
  'What certificates does he have?',
];

export function AskAjeyWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      role: 'assistant',
      content:
        'Hi! I am "Ask Ajey". Ask me about Ajey C\'s education (8.78 SGPA at Jain University), technical skills, JARVIS Voice Assistant project, verified certificates, or AI security interests.',
      source: 'knowledge_base',
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 40);
  };

  const sendQuestion = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const res = await apiFetch<{ reply: string; source: 'gemini' | 'knowledge_base' }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: trimmed }),
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.reply, source: res.source },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err instanceof Error
              ? `Sorry, I couldn't process that right now: ${err.message}`
              : 'Unable to reach assistant.',
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendQuestion(input);
  };

  return (
    <div className="fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="mb-3 flex w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#11131A]/95 backdrop-blur-xl shadow-2xl"
            role="dialog"
            aria-label="Ask Ajey Portfolio Assistant"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4788FF]/15 text-[#4788FF]">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-white">Ask Ajey</p>
                  <p className="text-[11px] text-[#A0A4B0]">Verified portfolio assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMinimized((m) => !m)}
                  aria-label={minimized ? 'Expand Ask Ajey chat' : 'Minimize Ask Ajey chat'}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A0A4B0] hover:bg-white/5 hover:text-white"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close Ask Ajey chat"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A0A4B0] hover:bg-white/5 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Messages */}
                <div
                  ref={listRef}
                  className="flex max-h-[320px] min-h-[240px] flex-col gap-3 overflow-y-auto p-4"
                >
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                          msg.role === 'user'
                            ? 'bg-[#4788FF] text-white'
                            : 'border border-white/[0.08] bg-[#08090D] text-[#E6E8EE]'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-[#08090D] px-3.5 py-2.5 text-xs text-[#A0A4B0]">
                        <span>Thinking</span>
                        <span className="animate-bounce">.</span>
                        <span className="animate-bounce [animation-delay:120ms]">.</span>
                        <span className="animate-bounce [animation-delay:240ms]">.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] px-4 py-2.5">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendQuestion(prompt)}
                      className="rounded-lg border border-white/10 bg-[#08090D] px-2.5 py-1 text-[11px] text-[#A0A4B0] transition-colors hover:border-[#4788FF]/50 hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2 border-t border-white/[0.08] p-3"
                >
                  <label htmlFor="ask-ajey-input" className="sr-only">
                    Ask a question about Ajey C
                  </label>
                  <input
                    id="ask-ajey-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about skills, SGPA, JARVIS..."
                    className="h-10 flex-1 rounded-xl border border-white/10 bg-[#08090D] px-3 text-xs text-white placeholder-[#A0A4B0]/60 focus:border-[#4788FF] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    aria-label="Send message to Ask Ajey"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4788FF] text-white transition-colors hover:bg-[#3A77EB] disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setMinimized(false);
        }}
        aria-label={open ? 'Close Ask Ajey assistant' : 'Open Ask Ajey assistant'}
        className="inline-flex h-12 items-center gap-2.5 rounded-full border border-white/15 bg-[#11131A]/95 px-4 text-xs font-semibold text-white backdrop-blur-xl shadow-xl transition-colors hover:border-[#4788FF]/60"
      >
        <MessageSquare className="h-4 w-4 text-[#4788FF]" aria-hidden="true" />
        <span>Ask Ajey</span>
      </button>
    </div>
  );
}
