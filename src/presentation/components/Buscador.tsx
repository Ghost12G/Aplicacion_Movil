import { View, TextInput, Pressable, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  valor: string;
  onCambiar: (texto: string) => void;
  placeholder?: string;
}

export default function Buscador({ valor, onCambiar, placeholder = "Buscar..." }: Props) {
  const colorScheme = useColorScheme();

  return (
    <View className="flex-row items-center bg-gray-100 dark:bg-slate-800 rounded-full px-4 py-2 mb-4">
      <Ionicons
        name="search"
        size={20}
        color={colorScheme === "dark" ? "#cbd5e1" : "#6b7280"}
      />
      <TextInput
        className="flex-1 ml-2 text-base"
        placeholder={placeholder}
        placeholderTextColor={colorScheme === "dark" ? "#94a3b8" : "#6b7280"}
        style={{ color: colorScheme === "dark" ? "#f1f5f9" : "#111827" }}
        value={valor}
        onChangeText={onCambiar}
      />
      {valor !== "" && (
        <Pressable onPress={() => onCambiar("")}>
          <Ionicons
            name="close-circle"
            size={20}
            color={colorScheme === "dark" ? "#cbd5e1" : "#6b7280"}
          />
        </Pressable>
      )}
    </View>
  );
}
