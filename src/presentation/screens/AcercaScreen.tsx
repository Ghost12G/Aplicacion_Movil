import { ScrollView, View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Cabecera from "../components/Cabecera";

type NombreIcono = keyof typeof Ionicons.glyphMap;

const funciones: { icono: NombreIcono; texto: string }[] = [
  { icono: "videocam", texto: "Reservar y cancelar citas con el especialista que elijas" },
  { icono: "calendar", texto: "Ver tus citas programadas y sus detalles" },
  { icono: "medkit", texto: "Consultar tus atenciones realizadas" },
  { icono: "document-text", texto: "Revisar tus recetas y descansos médicos" },
  { icono: "create", texto: "Enviar y consultar tus solicitudes desde tu cuenta" },
  { icono: "person", texto: "Actualizar tus datos de contacto" },
  { icono: "water", texto: "Hacer el test de riesgo de diabetes tipo 2" },
];

const avisos = [
  {
    icono: "wifi" as const,
    titulo: "Conexión a internet",
    texto:
      "Necesitas internet para confirmar reservas y enviar o editar solicitudes. El catálogo y las citas descargadas pueden consultarse desde este teléfono sin conexión.",
  },
  {
    icono: "sync" as const,
    titulo: "Cambios pendientes",
    texto:
      "Si cancelas una cita sin conexión, la cancelación queda pendiente. Se sincroniza al recuperar internet y el espacio no se libera en otros teléfonos hasta entonces.",
  },
  {
    icono: "lock-closed" as const,
    titulo: "Tu cuenta",
    texto:
      "Tus citas y solicitudes se guardan vinculadas a tu cuenta. Cierra sesión si compartes el teléfono con otra persona.",
  },
  {
    icono: "chatbubble-ellipses" as const,
    titulo: "Solicitudes",
    texto:
      "Puedes guardar y consultar tus solicitudes desde tu cuenta. Esta versión no muestra respuestas del personal de la clínica.",
  },
  {
    icono: "medkit" as const,
    titulo: "Información de salud",
    texto:
      "El test de riesgo de diabetes es orientativo y no reemplaza un diagnóstico ni una consulta con un profesional de salud.",
  },
];

export default function AcercaScreen() {
  return (
    <View className="flex-1 bg-white">
      <Cabecera titulo="Acerca de" />

      <ScrollView className="px-4 pt-5" contentContainerClassName="pb-10">
        <Image
          source={require("../../../assets/images/logo-clinic-digital.png")}
          className="w-full h-44"
          resizeMode="contain"
        />
        <Text className="text-center text-gray-500 mb-5">Versión 1.0.0</Text>

        <Text className="text-2xl font-bold text-sky-800 mb-2">
          Tu atención, más cerca
        </Text>
        <Text className="text-base mb-5">
          Clinic Digital te ayuda a organizar tus citas y consultar información de tus
          atenciones desde el celular.
        </Text>

        <Text className="text-2xl font-bold text-sky-800 mb-3">¿Qué puedes hacer?</Text>
        {funciones.map((f) => (
          <View key={f.texto} className="flex-row items-center bg-cyan-50 rounded-xl p-3 mb-2">
            <Ionicons name={f.icono} size={26} color="#0369a1" />
            <Text className="flex-1 ml-3 text-base">{f.texto}</Text>
          </View>
        ))}

        <Text className="text-2xl font-bold text-sky-800 mt-4 mb-3">
          Información importante
        </Text>
        {avisos.map((aviso) => (
          <View
            key={aviso.titulo}
            className="mb-3 rounded-2xl border border-sky-100 bg-sky-50 p-4"
          >
            <View className="mb-1 flex-row items-center">
              <Ionicons name={aviso.icono} size={22} color="#0369a1" />
              <Text className="ml-2 flex-1 text-base font-bold text-sky-900">
                {aviso.titulo}
              </Text>
            </View>
            <Text className="text-sm leading-5 text-slate-700">{aviso.texto}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
