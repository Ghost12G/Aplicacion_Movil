import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  valor: string;
  onCambiar: (texto: string) => void;
  placeholder?: string;
}

export default function Buscador({ valor, onCambiar, placeholder = "Buscar..." }: Props) {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mb-4">
      <Ionicons name="search" size={20} color="#6b7280" />
      <TextInput
        className="flex-1 ml-2 text-base"
        placeholder={placeholder}
        value={valor}
        onChangeText={onCambiar}
      />
      {valor !== "" && (
        <Pressable onPress={() => onCambiar("")}>
          <Ionicons name="close-circle" size={20} color="#6b7280" />
        </Pressable>
      )}
    </View>
  );
}
