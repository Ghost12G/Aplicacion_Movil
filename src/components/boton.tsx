import { Pressable, Text } from "react-native";

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: "primario" | "secundario" | "peligro" | "gris";
  deshabilitado?: boolean;
}

const colores = {
  primario: "bg-sky-600",
  secundario: "bg-sky-900",
  peligro: "bg-red-500",
  gris: "bg-gray-200",
};

export default function Boton({
  titulo,
  onPress,
  variante = "primario",
  deshabilitado = false,
}: Props) {
  const fondo = deshabilitado ? "bg-gray-300" : colores[variante];
  const colorTexto = variante === "gris" && !deshabilitado ? "text-gray-700" : "text-white";

  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      className={`${fondo} py-3 rounded-full items-center`}
    >
      <Text className={`${colorTexto} text-lg`}>{titulo}</Text>
    </Pressable>
  );
}
