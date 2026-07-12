import { useEffect, useState } from 'react';
import { Text } from 'react-native';

export function Counter({ start }: { start: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(start);
  }, []);
  console.log(n);
  return <Text>{n}</Text>;
}
