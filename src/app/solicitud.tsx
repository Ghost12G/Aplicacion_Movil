import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Cabecera from "../components/Cabecera";
import InputField from "../components/InputField";
import Boton from "../components/boton";
import ModalExito from "../components/ModalExito";
import { useFormulario } from "../hooks/useFormulario";
import {
  actualizarSolicitud,
  agregarSolicitud,
  obtenerSolicitudes,
} from "../data/almacen";
import { TipoSolicitud } from "../types/usuario";
import { formatearFecha } from "../utils/fechas";

const tipos: TipoSolicitud[] = ["Consulta", "Reclamo", "Sugerencia"];

export default function SolicitudScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  // Si llega un id, estamos EDITANDO una solicitud que ya existe
  const existente = id ? obtenerSolicitudes().find((s) => s.id === id) : undefined;

  const [guardado, setGuardado] = useState(false);
  const { valores, errores, setErrores, cambiar } = useFormulario({
    nombre: existente ? existente.nombre : "",
    telefono: existente ? existente.telefono : "",
    tipo: existente ? existente.tipo : "",
    descripcion: existente ? existente.descripcion : "",
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

  const guardar = () => {
    if (!validar()) return;

    const datos = {
      nombre: valores.nombre.trim(),
      telefono: valores.telefono,
      tipo: valores.tipo as TipoSolicitud,
      descripcion: valores.descripcion.trim(),
    };

    if (existente) {
      actualizarSolicitud(existente.id, datos); // actualizar
    } else {
      agregarSolicitud({
        id: Date.now().toString(),
        fecha: formatearFecha(new Date()),
        ...datos,
      }); // crear
    }
    setGuardado(true);
  };

  const cerrarModal = () => {
    setGuardado(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <Cabecera titulo={existente ? "Editar solicitud" : "Nueva solicitud"} />

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

        <Boton
          titulo={existente ? "Guardar cambios" : "Enviar solicitud"}
          onPress={guardar}
        />
        <View className="h-3" />
        <Boton titulo="Cancelar" variante="gris" onPress={() => router.back()} />
      </ScrollView>

      <ModalExito
        visible={guardado}
        titulo="Solicitud"
        mensaje={
          existente
            ? "Los cambios se guardaron correctamente"
            : "Tu solicitud se registró correctamente. Puedes verla en Mis solicitudes"
        }
        onCerrar={cerrarModal}
      />
    </View>
  );
}
