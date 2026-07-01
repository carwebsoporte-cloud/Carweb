import Link from 'next/link';

/* Migas de pan visibles y semánticas (<nav><ol>) con aria-current en la página
   actual. El BreadcrumbList JSON-LD se inyecta aparte (BreadcrumbJsonLd) con los
   mismos items para mantener coherencia entre lo visible y lo estructurado. */

export type Crumb = { name: string; href?: string };

export default function Breadcrumbs({
  items,
  className = '',
  monoLast = false,
}: {
  items: Crumb[];
  className?: string;
  monoLast?: boolean;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-sm flex-wrap">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-2">
              {it.href && !last ? (
                <Link href={it.href} className="text-slate-400 hover:text-neon transition-colors">
                  {it.name}
                </Link>
              ) : (
                <span aria-current="page" className={`text-neon font-semibold ${monoLast ? 'font-mono' : ''} truncate max-w-[220px]`}>
                  {it.name}
                </span>
              )}
              {!last && <span aria-hidden="true" className="text-slate-600">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
