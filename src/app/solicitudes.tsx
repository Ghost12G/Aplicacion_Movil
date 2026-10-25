import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import Cabecera from "../components/Cabecera";
import Pestanas from "../components/Pestanas";
import Buscador from "../components/Buscador";
import { eliminarSolicitud, obtenerSolicitudes } from "../data/almacen";
import { Solicitud } from "../types/usuario";

const filtros = ["Todas", "Consulta", "Reclamo", "Sugerencia"];

export default function MisSolicitudes() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(obtenerSolicitudes);
  const [filtro, setFiltro] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");

  // Cada vez que la pantalla vuelve a mostrarse (por ejemplo, después de
  // editar), se recarga la lista para ver los cambios.
  useFocusEffect(
    useCallback(() => {
      setSolicitudes(obtenerSolicitudes());
    }, [])
  );

  const visibles = solicitudes.filter(
    (s) =>
      (filtro === "Todas" || s.tipo === filtro) &&
      `${s.nombre} ${s.descripcion}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const eliminar = (solicitud: Solicitud) => {
    Alert.alert("Eliminar solicitud", "¿Seguro que quieres eliminar esta solicitud?", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          eliminarSolicitud(solicitud.id);
          setSolicitudes(obtenerSolicitudes());
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <Cabecera titulo="Mis solicitudes" />
      <Pestanas opciones={filtros} activa={filtro} onCambiar={setFiltro} desplazable />

      <ScrollView className="px-4 pt-4" contentContainerClassName="pb-28">
        <Buscador
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Buscar por nombre o descripción..."
        />

        {visibles.map((s) => (
          <View
            key={s.id}
            className="bg-white rounded-xl shadow mb-4 overflow-hidden border border-sky-200"
          >
            <View className="flex-row items-center justify-between bg-sky-700 px-3 py-2">
              <Text className="text-white font-bold">{s.tipo.toUpperCase()}</Text>
              <Text className="text-white">{s.fecha}</Text>
            </View>

            <View className="p-3">
              <Text className="font-bold text-base">{s.nombre}</Text>
              <Text className="text-sky-700">Teléfono: <Text className="text-black">{s.telefono}</Text></Text>
              <Text className="mt-1" numberOfLines={3}>{s.descripcion}</Text>

              <View className="flex-row mt-3">
                <Pressable
                  onPress={() => router.push({ pathname: "/solicitud", params: { id: s.id } })}
                  className="bg-sky-500 rounded-2xl px-4 py-3 items-center mr-3"
                >
                  <Ionicons name="create" size={22} color="white" />
                  <Text className="text-white text-xs mt-1">Editar</Text>
                </Pressable>
                <Pressable
                  onPress={() => eliminar(s)}
                  className="bg-red-500 rounded-2xl px-4 py-3 items-center"
                >
                  <Ionicons name="trash" size={22} color="white" />
                  <Text className="text-white text-xs mt-1">Eliminar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}

        {visibles.length === 0 && (
          <Text className="text-center text-gray-500 mt-8">
            {solicitudes.length === 0
              ? "Aún no tienes solicitudes. Pulsa + para crear una"
              : "No se encontraron solicitudes"}
          </Text>
        )}
      </ScrollView>

      {/* Botón + para crear una solicitud nueva */}
      <Pressable
        onPress={() => router.push("/solicitud")}
        className="absolute bottom-8 right-6 bg-sky-900 w-16 h-16 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={34} color="white" />
      </Pressable>
    </View>
  );
}
