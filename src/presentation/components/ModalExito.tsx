import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import Text from "./ThemedText";
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
  contenidoExtra?: ReactNode;
}

const estilos = {
  exito: {
    icono: "checkmark" as const,
    fondoIcono: "bg-emerald-100 dark:bg-emerald-950/40",
    color: "#059669",
    boton: "bg-sky-800",
  },
  error: {
    icono: "close" as const,
    fondoIcono: "bg-red-100 dark:bg-red-950/40",
    color: "#dc2626",
    boton: "bg-sky-800",
  },
  informacion: {
    icono: "information" as const,
    fondoIcono: "bg-sky-100 dark:bg-slate-800",
    color: "#0369a1",
    boton: "bg-sky-800",
  },
  confirmacion: {
    icono: "help" as const,
    fondoIcono: "bg-amber-100 dark:bg-amber-950/40",
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
  contenidoExtra,
}: Props) {
  const estilo = estilos[tipo];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <KeyboardAvoidingView
        className="flex-1 bg-slate-950/55"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full rounded-3xl bg-white dark:bg-slate-900 px-6 pt-7 pb-6 shadow-2xl">
            <View className={`self-center rounded-full p-4 ${estilo.fondoIcono}`}>
              <Ionicons name={estilo.icono} size={36} color={estilo.color} />
            </View>
            <Text className="mt-4 text-center text-2xl font-bold text-slate-900">
              {titulo}
            </Text>
            <Text className="mt-3 text-center text-base leading-6 text-slate-600">
              {mensaje}
            </Text>
            {contenidoExtra}
            <View className={`mt-6 ${onAccion ? "flex-row" : ""}`}>
              {onAccion && (
                <Pressable
                  onPress={onCerrar}
                  className="mr-3 flex-1 items-center rounded-2xl border border-slate-200 dark:border-slate-700 py-3.5"
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
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
