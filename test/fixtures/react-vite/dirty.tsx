import { useEffect, useState } from 'react';

export function Counter({ start }: { start: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(start);
  }, []);
  console.log(n);
  return <button type="button">{n}</button>;
}
