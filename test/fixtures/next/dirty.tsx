import { useEffect, useState } from 'react';

export default function Widget({ start, src }: { start: number; src: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(start);
  }, []);
  console.log(n);
  // Triggers @next/next/no-img-element (use next/image instead).
  return <img src={src} alt="" />;
}
