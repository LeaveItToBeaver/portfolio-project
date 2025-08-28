import React from 'react';

type Props = React.PropsWithChildren<{ className?: string }>
export default function GradientText({ children, className }: Props) {
  return (
    <span 
      className={["bg-clip-text text-transparent filter-noise", "drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]", "[text-shadow:_1px_1px_1px_rgba(0,0,0,0.3)]", className].join(" ")}
      style={{
        backgroundImage: `
          linear-gradient(91deg, rgba(156,127,171,1), rgba(200,253,201,1)),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 278 278' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.31' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
        `
      }}
    >
      {children}
    </span>
  );
}
