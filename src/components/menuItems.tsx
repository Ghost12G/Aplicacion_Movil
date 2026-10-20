import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  titulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export default function MenuItem({ titulo, icono, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-gray-50 p-4 rounded-xl mb-3 shadow"
    >
      <Ionicons name={icono} size={32} color="#0369a1" />
      <Text className="flex-1 ml-4 text-base">{titulo}</Text>
      <Ionicons name="chevron-forward" size={22} color="#374151" />
    </Pressable>
  );
}