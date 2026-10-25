import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import Cabecera from "../components/Cabecera";
import Pestanas from "../components/Pestanas";
import Buscador from "../components/Buscador";
import TarjetaHistorial from "../components/TarjetaHistorial";
import { CENTRO } from "../data/catalogo";
import { atenciones } from "../data/historial";
import { TipoAtencion } from "../types/usuario";

const tipos: TipoAtencion[] = ["C.Externa", "Emergencia", "Hospitalización", "Cirugía"];

export default function Atenciones() {
  const [tipo, setTipo] = useState<string>("C.Externa");
  const [busqueda, setBusqueda] = useState("");

  const visibles = atenciones.filter(
    (a) =>
      a.tipo === tipo &&
      `${a.especialidad} ${a.especialista}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white">
      <Cabecera titulo="Atenciones Realizadas" />
      <Pestanas opciones={tipos} activa={tipo} onCambiar={setTipo} desplazable />

      <ScrollView className="px-4 pt-4" contentContainerClassName="pb-10">
        <Buscador
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Buscar por especialidad o especialista..."
        />

        {visibles.map((a) => (
          <TarjetaHistorial key={a.id} fecha={a.fecha} etiqueta="(Atención)">
            <Text className="font-bold text-base">{a.especialidad}</Text>
            <Text className="text-sky-700">IPRESS:</Text>
            <Text>{CENTRO}</Text>
            <Text className="text-sky-700">Especialista:</Text>
            <Text>{a.especialista}</Text>
            <Text className="text-sky-700">
              Acto Médico: <Text className="text-black">{a.actoMedico}</Text>
            </Text>
          </TarjetaHistorial>
        ))}

        {visibles.length === 0 && (
          <Text className="text-center text-gray-500 mt-8">
            No hay atenciones registradas
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
