import { Pressable, useColorScheme } from "react-native";
import Text from "./ThemedText";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  titulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export default function MenuItem({ titulo, icono, onPress }: Props) {
  const colorScheme = useColorScheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-gray-50 dark:bg-slate-900 p-4 rounded-xl mb-3 shadow"
    >
      <Ionicons name={icono} size={32} color={colorScheme === "dark" ? "#7dd3fc" : "#0369a1"} />
      <Text className="flex-1 ml-4 text-base">{titulo}</Text>
      <Ionicons
        name="chevron-forward"
        size={22}
        color={colorScheme === "dark" ? "#cbd5e1" : "#374151"}
      />
    </Pressable>
  );
}
