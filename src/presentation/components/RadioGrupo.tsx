import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  pregunta: string;
  opciones: string[];
  valor: string;
  onCambiar: (opcion: string) => void;
  horizontal?: boolean;
}

export default function RadioGrupo({
  pregunta,
  opciones,
  valor,
  onCambiar,
  horizontal = false,
}: Props) {
  return (
    <View className="mb-5">
      <Text className="text-lg mb-2">{pregunta}</Text>
      <View className={horizontal ? "flex-row" : ""}>
        {opciones.map((op) => (
          <Pressable
            key={op}
            onPress={() => onCambiar(op)}
            className={`flex-row items-center py-1 ${horizontal ? "mr-6" : "mb-1"}`}
          >
            <Ionicons
              name={valor === op ? "radio-button-on" : "radio-button-off"}
              size={28}
              color="#0369a1"
            />
            <Text className="ml-2 text-base flex-1">{op}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
