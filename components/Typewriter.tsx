'use client';
import { useEffect, useState } from 'react';

export default function Typewriter({ phrases, speed = 200, pause = 200 }: { phrases: string[], speed?: number, pause?: number }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [dir, setDir] = useState<'forward' | 'backwards'>('forward');

  useEffect(() => {
    const target = phrases[i % phrases.length];
    const t = setTimeout(() => {
      if (dir === 'forward') {
        if (text.length < target.length) {
          setText(target.slice(0, text.length + 1));
        }
        else {
          setDir('backwards');
          clearTimeout(t);
          setTimeout(() => { }, pause);
        }
      } else {
        if (text.length > 0) {
          setText(target.slice(0, text.length - 1));
        }
        else {
          setDir('forward');
          setI(i + 1);
        }
      }
    }, dir === 'forward' ? speed : speed / 2);
    return () => clearTimeout(t);
  }, [text, dir, i, phrases, speed, pause]);

  useEffect(() => { setText(''); setDir('forward'); }, [i]);

  return (
    <span className="relative">
      <span className="after:content-[''] after:inline-block after:w-px after:h-[1.2em] after:align-[-0.2em] after:bg-current after:ml-1 after:animate-pulse">{text}</span>
    </span>
  );
}
