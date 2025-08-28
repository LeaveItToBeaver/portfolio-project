import React from 'react';

type Props = React.PropsWithChildren<{ className?: string }>
export default function GradientText({ children, className }: Props) {
  return (
    <span className={["bg-text-gradient-noise bg-clip-text text-transparent filter-noise", "drop-shadow-[1px_1px_1px_rgba(0,0,0,0.5)]", "[text-shadow:_1px_1px_1px_rgba(0,0,0,0.3)]", className].join(" ")}>
      {children}
    </span>
  );
}
