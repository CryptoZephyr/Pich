import { DOCS_NAV } from "./docs-navigation";

export function DocsSidebar({ current }: { current: string }) {
  return (
    <nav aria-label="Docs" className="space-y-6 text-sm">
      {DOCS_NAV.map((section) => (
        <div key={section.slug}>
          <p className="font-head text-xs uppercase tracking-wide text-muted-foreground">{section.title}</p>
          <ul className="mt-2 space-y-1">
            {section.pages.map((p) => {
              const href = `/docs/${section.slug}/${p.slug}`;
              const active = href === current;
              return (
                <li key={p.slug}>
                  <a
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded border-2 px-2 py-1 ${active ? "bg-primary font-medium text-primary-foreground" : "border-transparent hover:bg-muted"}`}
                  >
                    {p.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
