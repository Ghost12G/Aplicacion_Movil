import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import Cabecera from "../components/Cabecera";
import InputField from "../components/InputField";
import Boton from "../components/boton";
import { useFormulario } from "../hooks/useFormulario";
import { Solicitud, TipoSolicitud } from "../types/usuario";

const tipos: TipoSolicitud[] = ["Consulta", "Reclamo", "Sugerencia"];

export default function SolicitudScreen() {
  const router = useRouter();

  const { valores, errores, setErrores, cambiar, limpiar } = useFormulario({
    nombre: "",
    telefono: "",
    tipo: "",
    descripcion: "",
  });

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (valores.nombre.trim() === "") {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }
    if (valores.telefono.trim() === "") {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (valores.telefono.length !== 9) {
      nuevosErrores.telefono = "El teléfono debe tener 9 dígitos";
    }
    if (valores.tipo === "") {
      nuevosErrores.tipo = "Elige un tipo de solicitud";
    }
    if (valores.descripcion.trim() === "") {
      nuevosErrores.descripcion = "La descripción es obligatoria";
    } else if (valores.descripcion.trim().length < 10) {
      nuevosErrores.descripcion = "Escribe al menos 10 caracteres";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const enviar = () => {
    if (!validar()) return;

    const solicitud: Solicitud = {
      nombre: valores.nombre,
      telefono: valores.telefono,
      tipo: valores.tipo as TipoSolicitud,
      descripcion: valores.descripcion,
    };
    console.log("Solicitud enviada:", solicitud);

    Alert.alert(
      "Solicitud enviada",
      `Gracias ${valores.nombre}, ya registramos tu solicitud.`
    );
    limpiar();
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <Cabecera titulo="Nueva solicitud" />

      <ScrollView className="px-4 pt-6" contentContainerClassName="pb-10">
        <InputField
          icono="person"
          placeholder="Nombre del cliente"
          value={valores.nombre}
          onChangeText={(texto) => cambiar("nombre", texto)}
          error={errores.nombre}
        />
        <InputField
          icono="call"
          placeholder="Teléfono"
          value={valores.telefono}
          onChangeText={(texto) => cambiar("telefono", texto)}
          teclado="numeric"
          error={errores.telefono}
        />

        <Text className="text-base mb-2">Tipo de solicitud</Text>
        <View className="flex-row mb-1">
          {tipos.map((opcion) => (
            <Pressable
              key={opcion}
              onPress={() => cambiar("tipo", opcion)}
              className={`px-4 py-2 rounded-full mr-2 ${
                valores.tipo === opcion ? "bg-sky-600" : "bg-gray-200"
              }`}
            >
              <Text
                className={valores.tipo === opcion ? "text-white" : "text-gray-700"}
              >
                {opcion}
              </Text>
            </Pressable>
          ))}
        </View>
        {errores.tipo ? (
          <Text className="text-red-600 text-sm mb-3">{errores.tipo}</Text>
        ) : (
          <View className="mb-4" />
        )}

        <InputField
          icono="create"
          placeholder="Descripción"
          value={valores.descripcion}
          onChangeText={(texto) => cambiar("descripcion", texto)}
          multilinea
          error={errores.descripcion}
        />

        <Boton titulo="Enviar solicitud" onPress={enviar} />
      </ScrollView>
    </View>
  );
}
