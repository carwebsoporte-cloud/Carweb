import Link from 'next/link';

interface PaginationProps {
  basePath: string;   // ej: /category/P
  page: number;
  pages: number;
}

/* Construye la lista de páginas a mostrar con elipsis */
function pageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | '…')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push('…');
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push('…');
  out.push(total);
  return out;
}

export default function Pagination({ basePath, page, pages }: PaginationProps) {
  if (pages <= 1) return null;

  const href = (p: number) => (p <= 1 ? basePath : `${basePath}?page=${p}`);
  const items = pageList(page, pages);

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Paginación">
      {/* Anterior */}
      {page > 1 ? (
        <Link href={href(page - 1)} className="px-3 py-2 glass rounded-lg text-slate-300 hover:text-neon hover:border-neon/40 transition-all" aria-label="Página anterior">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
      ) : (
        <span className="px-3 py-2 glass rounded-lg text-slate-700 cursor-not-allowed opacity-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </span>
      )}

      {/* Números */}
      {items.map((it, i) =>
        it === '…' ? (
          <span key={`e${i}`} className="px-2 text-slate-600">…</span>
        ) : it === page ? (
          <span key={it} className="min-w-[2.5rem] text-center px-3 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617]">
            {it}
          </span>
        ) : (
          <Link key={it} href={href(it)} className="min-w-[2.5rem] text-center px-3 py-2 glass rounded-lg text-slate-300 hover:text-neon hover:border-neon/40 transition-all">
            {it}
          </Link>
        )
      )}

      {/* Siguiente */}
      {page < pages ? (
        <Link href={href(page + 1)} className="px-3 py-2 glass rounded-lg text-slate-300 hover:text-neon hover:border-neon/40 transition-all" aria-label="Página siguiente">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      ) : (
        <span className="px-3 py-2 glass rounded-lg text-slate-700 cursor-not-allowed opacity-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </span>
      )}
    </nav>
  );
}
