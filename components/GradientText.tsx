import React from 'react';

type Props = React.PropsWithChildren<{ className?: string }>
export default function GradientText({ children, className }: Props) {
  return (
    <span className={["bg-gradient-to-r from-orange-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent", className].join(" ")}>
      {children}
    </span>
  );
}
