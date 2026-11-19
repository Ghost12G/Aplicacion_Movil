import { ScrollView, View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Cabecera from "../components/Cabecera";

type NombreIcono = keyof typeof Ionicons.glyphMap;

const funciones: { icono: NombreIcono; texto: string }[] = [
  { icono: "videocam", texto: "Reservar y cancelar citas con el especialista que elijas" },
  { icono: "calendar", texto: "Ver tus citas programadas y sus detalles" },
  { icono: "medkit", texto: "Consultar tus atenciones realizadas" },
  { icono: "document-text", texto: "Revisar tus recetas y descansos médicos" },
  { icono: "create", texto: "Enviar, editar y eliminar solicitudes" },
  { icono: "person", texto: "Actualizar tus datos de contacto" },
  { icono: "water", texto: "Hacer el test de riesgo de diabetes tipo 2" },
];

const tecnologias = [
  "React Native con Expo",
  "TypeScript",
  "Expo Router (navegación)",
  "NativeWind (estilos)",
  "Clean Architecture en 4 capas",
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

        <Text className="text-2xl font-bold text-sky-800 mb-2">¿Qué es Clinic Digital?</Text>
        <Text className="text-base mb-5">
          Clinic Digital es una aplicación móvil que permite a los pacientes de una clínica
          gestionar sus servicios desde el celular: reservar citas, consultar su historial
          y mantener sus datos al día, sin tener que acudir a la clínica.
        </Text>

        <Text className="text-2xl font-bold text-sky-800 mb-3">¿Qué puedes hacer?</Text>
        {funciones.map((f) => (
          <View key={f.texto} className="flex-row items-center bg-cyan-50 rounded-xl p-3 mb-2">
            <Ionicons name={f.icono} size={26} color="#0369a1" />
            <Text className="flex-1 ml-3 text-base">{f.texto}</Text>
          </View>
        ))}

        <Text className="text-2xl font-bold text-sky-800 mt-4 mb-3">Tecnología</Text>
        {tecnologias.map((t) => (
          <View key={t} className="flex-row items-center mb-2">
            <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
            <Text className="ml-2 text-base">{t}</Text>
          </View>
        ))}

        <Text className="text-2xl font-bold text-sky-800 mt-4 mb-2">Proyecto académico</Text>
        <Text className="text-base">
          Desarrollado como proyecto del curso de Desarrollo de Aplicaciones Móviles. Los datos
          se guardan solo en la memoria de la aplicación: al cerrarla, se pierden.
        </Text>
      </ScrollView>
    </View>
  );
}
