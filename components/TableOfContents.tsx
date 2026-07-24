import type { TocItem } from '@/lib/toc';

export default function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < 3) {
    return null;
  }

  return (
    <details open className="group mb-10 rounded-2xl border border-rd-line bg-rd-graphite/60 p-5">
      <summary className="flex cursor-pointer items-center justify-between gap-2 font-display text-sm font-semibold text-white">
        <span className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D61F26" strokeWidth="1.8">
            <path d="M4 6h16M4 12h16M4 18h10" />
          </svg>
          Sommaire
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-white/40 transition-transform group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <nav className="mt-4 space-y-1.5 border-t border-white/5 pt-4">
        {items.map((item, index) => (
          <a
            key={`${item.slug}-${index}`}
            href={`#${item.slug}`}
            className={`block text-sm text-white/60 transition-colors hover:text-rd-redlight ${
              item.level === 1 ? 'font-medium text-white/80' : item.level === 3 ? 'pl-8 text-white/45' : 'pl-4'
            }`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </details>
  );
}