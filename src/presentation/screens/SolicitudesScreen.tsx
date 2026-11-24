import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Text from "../components/ThemedText";
import { Solicitud } from "../../domain/entities/Solicitud";
import Buscador from "../components/Buscador";
import Cabecera from "../components/Cabecera";
import Pestanas from "../components/Pestanas";
import ModalExito from "../components/ModalExito";
import { useSolicitudes } from "../hooks/useSolicitudes";

const filtros = ["Todas", "Consulta", "Reclamo", "Sugerencia"];

export default function SolicitudesScreen() {
  const router = useRouter();
  const {
    solicitudes,
    cargando,
    error,
    cargar,
    eliminar: eliminarPorId,
  } = useSolicitudes();
  const [filtro, setFiltro] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [solicitudAEliminar, setSolicitudAEliminar] = useState<Solicitud | null>(null);

  const visibles = solicitudes.filter(
    (s) =>
      (filtro === "Todas" || s.tipo === filtro) &&
      `${s.nombre} ${s.descripcion}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const eliminar = (solicitud: Solicitud) => {
    setSolicitudAEliminar(solicitud);
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <Cabecera titulo="Mis solicitudes" />
      <Pestanas opciones={filtros} activa={filtro} onCambiar={setFiltro} desplazable />

      <ScrollView className="px-4 pt-4" contentContainerClassName="pb-28">
        {cargando && (
          <Text className="py-5 text-center text-sky-800">
            Cargando tus solicitudes...
          </Text>
        )}
        {error !== "" && (
          <View className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 p-4">
            <Text className="text-center text-red-700">{error}</Text>
            <Pressable onPress={() => void cargar()} className="mt-2">
              <Text className="text-center font-bold text-sky-800">Reintentar</Text>
            </Pressable>
          </View>
        )}
        <Buscador
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Buscar por nombre o descripción..."
        />

        {!cargando && error === "" && visibles.map((s) => (
          <View
            key={s.id}
            className="bg-white dark:bg-slate-900 rounded-xl shadow mb-4 overflow-hidden border border-sky-200 dark:border-slate-700"
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

        {!cargando && error === "" && visibles.length === 0 && (
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

      <ModalExito
        visible={solicitudAEliminar !== null}
        titulo="Eliminar solicitud"
        mensaje="¿Seguro que quieres eliminar esta solicitud de tu cuenta?"
        tipo="confirmacion"
        textoAccion="Eliminar"
        textoSecundario="Conservar"
        onCerrar={() => setSolicitudAEliminar(null)}
        onAccion={() => {
          if (solicitudAEliminar) {
            void eliminarPorId(solicitudAEliminar.id).catch(() => undefined);
          }
          setSolicitudAEliminar(null);
        }}
      />
    </View>
  );
}
