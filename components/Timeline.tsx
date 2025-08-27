import React from 'react';

export type TimelineItem = {
  title: string;
  org?: string;
  location?: string;
  start?: string;
  end?: string;
  bullets?: string[];
};

export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="relative pl-10">
      {/* Y axis */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border" aria-hidden />
      <ul className="space-y-8">
        {items.map((it, idx) => (
          <li key={idx} className="relative">
            {/* Dot */}
            <div className="absolute -left-[6px] mt-1 w-3 h-3 rounded-full border bg-background" />
            <div className="rounded-2xl border p-4">
              <div className="flex items-baseline gap-2">
                <h3 className="text-lg font-semibold">{it.title}</h3>
                {it.org && <span className="text-sm text-muted-foreground">· {it.org}</span>}
              </div>
              {(it.start || it.end || it.location) && (
                <p className="text-xs text-muted-foreground mt-1"> {
                  [
                    it.location,
                    [it.start, it.end]
                      .filter(Boolean).join(' – ')
                  ].filter(Boolean).join(' · ')
                }
                </p>
              )}
              {it.bullets && it.bullets.length > 0 && (
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                  {it.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
