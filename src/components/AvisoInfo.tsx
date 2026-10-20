import { View, Text } from "react-native";

interface Props {
  texto: string;
}

export default function AvisoInfo({ texto }: Props) {
  return (
    <View className="bg-sky-600 rounded-xl px-4 py-3 mb-3">
      <Text className="text-white text-center">{texto}</Text>
    </View>
  );
}