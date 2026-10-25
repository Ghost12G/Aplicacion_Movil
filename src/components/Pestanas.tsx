import { View, Text, Pressable, ScrollView } from "react-native";

interface Props {
  opciones: string[];
  activa: string;
  onCambiar: (opcion: string) => void;
  desplazable?: boolean; // true cuando son muchas y no caben en pantalla
}

export default function Pestanas({
  opciones,
  activa,
  onCambiar,
  desplazable = false,
}: Props) {
  const botones = opciones.map((op) => (
    <Pressable
      key={op}
      onPress={() => onCambiar(op)}
      className={`py-3 items-center ${desplazable ? "px-6" : "flex-1"} ${
        activa === op ? "bg-sky-900" : "bg-gray-200"
      }`}
    >
      <Text className={`text-lg ${activa === op ? "text-white" : "text-gray-800"}`}>
        {op}
      </Text>
    </Pressable>
  ));

  if (desplazable) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="grow-0">
        {botones}
      </ScrollView>
    );
  }

  return <View className="flex-row">{botones}</View>;
}
