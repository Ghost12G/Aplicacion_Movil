import { Modal, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  titulo: string;
  mensaje: string;
  onCerrar: () => void;
  tipo?: "exito" | "error" | "informacion" | "confirmacion";
  textoAccion?: string;
  onAccion?: () => void;
  textoSecundario?: string;
}

const estilos = {
  exito: {
    icono: "checkmark" as const,
    fondoIcono: "bg-emerald-100",
    color: "#059669",
    boton: "bg-sky-800",
  },
  error: {
    icono: "close" as const,
    fondoIcono: "bg-red-100",
    color: "#dc2626",
    boton: "bg-sky-800",
  },
  informacion: {
    icono: "information" as const,
    fondoIcono: "bg-sky-100",
    color: "#0369a1",
    boton: "bg-sky-800",
  },
  confirmacion: {
    icono: "help" as const,
    fondoIcono: "bg-amber-100",
    color: "#b45309",
    boton: "bg-red-600",
  },
};

export default function ModalExito({
  visible,
  titulo,
  mensaje,
  onCerrar,
  tipo = "exito",
  textoAccion = "Entendido",
  onAccion,
  textoSecundario = "Cancelar",
}: Props) {
  const estilo = estilos[tipo];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View className="flex-1 items-center justify-center bg-slate-950/55 px-6">
        <View className="w-full rounded-3xl bg-white px-6 pt-7 pb-6 shadow-2xl">
          <View className={`self-center rounded-full p-4 ${estilo.fondoIcono}`}>
            <Ionicons name={estilo.icono} size={36} color={estilo.color} />
          </View>
          <Text className="mt-4 text-center text-2xl font-bold text-slate-900">
            {titulo}
          </Text>
          <Text className="mt-3 text-center text-base leading-6 text-slate-600">
            {mensaje}
          </Text>
          <View className={`mt-6 ${onAccion ? "flex-row" : ""}`}>
            {onAccion && (
              <Pressable
                onPress={onCerrar}
                className="mr-3 flex-1 items-center rounded-2xl border border-slate-200 py-3.5"
              >
                <Text className="text-base font-bold text-slate-700">
                  {textoSecundario}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={onAccion ?? onCerrar}
              className={`items-center rounded-2xl py-3.5 ${estilo.boton} ${
                onAccion ? "flex-1" : "w-full"
              }`}
            >
              <Text className="text-base font-bold text-white">{textoAccion}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
