import { Text, View } from 'react-native';

export function Greeting({ name }: { name: string }) {
  // `__DEV__` is an RN runtime global the preset declares, so it must not trip no-undef.
  const label = __DEV__ ? `[dev] ${name}` : name;
  return (
    <View>
      <Text>Hello {label}</Text>
    </View>
  );
}
