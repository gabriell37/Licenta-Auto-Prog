'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { askAssistantAction, type AssistantLink } from '@/app/actions/assistant';
import { REPLIES } from '@/lib/assistant/kb';
import { cn } from '@/lib/utils';

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
  links?: AssistantLink[];
};

const STORAGE_KEY = 'autoprog_assistant_chat';
const CLIENT_ID_KEY = 'autoprog_assistant_id';

function getClientId(): string {
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    return 'anonymous-client';
  }
}

function browserLang(): 'ro' | 'en' {
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en')) return 'en';
  return 'ro';
}

/**
 * Floating customer-support assistant (bottom-right). Fully self-hosted —
 * intent matching + catalog search run in a server action, no external AI
 * service, so it costs nothing to operate.
 */
export function AssistantWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [input, setInput] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const requestSeq = React.useRef(0);

  // Restore the conversation so navigating between pages doesn't lose it.
  React.useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { messages: ChatMessage[]; suggestions: string[] };
        setMessages(parsed.messages ?? []);
        setSuggestions(parsed.suggestions ?? []);
      }
    } catch {
      // corrupted storage — start fresh
    }
  }, []);

  React.useEffect(() => {
    if (messages.length === 0) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, suggestions }));
    } catch {
      // storage full/blocked — chat still works in-memory
    }
  }, [messages, suggestions]);

  React.useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (messages.length === 0) {
      const lang = browserLang();
      setMessages([{ role: 'assistant', text: REPLIES.welcome[lang] }]);
      setSuggestions([...REPLIES.defaultSuggestions[lang]]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, pending, open]);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function toggleOpen() {
    setOpen((v) => !v);
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const seq = ++requestSeq.current;
    setMessages((m) => [...m, { role: 'user', text: trimmed }]);
    setSuggestions([]);
    setInput('');
    setPending(true);
    try {
      const reply = await askAssistantAction({ message: trimmed, clientId: getClientId() });
      if (seq !== requestSeq.current) return;
      setMessages((m) => [...m, { role: 'assistant', text: reply.text, links: reply.links }]);
      setSuggestions(reply.suggestions ?? []);
    } catch {
      if (seq !== requestSeq.current) return;
      const lang = browserLang();
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text:
            lang === 'ro'
              ? 'A apărut o problemă de conexiune. Încearcă din nou în câteva secunde.'
              : 'A connection problem occurred. Please try again in a few seconds.',
        },
      ]);
    } finally {
      if (seq === requestSeq.current) setPending(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  function handleSuggestion(s: string) {
    void send(s);
  }

  function handleLinkClick() {
    // On phones the panel covers the page — close it so the user sees where they landed.
    if (window.innerWidth < 768) setOpen(false);
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Asistent AutoProg"
          className="fixed bottom-36 right-4 z-50 flex h-[min(560px,calc(100dvh-11rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl md:bottom-24 md:right-6"
        >
          <div className="flex items-center gap-3 border-b border-border bg-brand px-4 py-3 text-fg-on-brand">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <Bot className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">Asistentul AutoProg</p>
              <p className="text-xs opacity-80">Răspunde instant · română sau English</p>
            </div>
            <button
              type="button"
              onClick={toggleOpen}
              aria-label="Închide asistentul"
              className="rounded-lg p-1.5 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4" aria-live="polite">
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'rounded-br-md bg-brand text-fg-on-brand'
                      : 'rounded-bl-md bg-surface-3 text-fg'
                  )}
                >
                  {msg.text}
                  {msg.links && msg.links.length > 0 && (
                    <span className="mt-2.5 flex flex-col gap-1.5">
                      {msg.links.map((link) => (
                        <Link
                          key={link.href + link.label}
                          href={link.href}
                          onClick={handleLinkClick}
                          className="block rounded-lg border border-border-strong bg-surface px-3 py-2 text-[13px] font-medium text-brand transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-surface-3 px-3.5 py-2.5 text-sm text-fg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  <span className="sr-only">Asistentul scrie…</span>
                  <span aria-hidden>…</span>
                </div>
              </div>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSuggestion(s)}
                  disabled={pending}
                  className="rounded-full border border-border-strong bg-surface px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Scrie un mesaj… / Type a message…"
              maxLength={500}
              aria-label="Mesaj către asistent"
              className="h-10 flex-1 rounded-lg border border-border-strong bg-surface px-3 text-sm text-fg placeholder:text-fg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" size="icon-sm" disabled={pending || input.trim().length === 0} aria-label="Trimite mesajul">
              <Send className="h-4 w-4" aria-hidden />
            </Button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        aria-label={open ? 'Închide asistentul' : 'Deschide asistentul AutoProg'}
        className={cn(
          'fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-fg-on-brand shadow-lg transition-all hover:bg-brand-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg md:bottom-6 md:right-6',
          open && 'scale-90'
        )}
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <MessageCircle className="h-6 w-6" aria-hidden />}
      </button>
    </>
  );
}
