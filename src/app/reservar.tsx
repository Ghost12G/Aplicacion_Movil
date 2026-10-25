import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Cabecera from "../components/Cabecera";
import PasosReserva from "../components/PasosReserva";
import TarjetaInfo from "../components/TarjetaInfo";
import Calendario from "../components/Calendario";
import Buscador from "../components/Buscador";
import ModalExito from "../components/ModalExito";
import Boton from "../components/boton";
import { CENTRO, especialidades } from "../data/catalogo";
import { agregarCita, obtenerUsuarioActual } from "../data/almacen";
import {
  HORAS_DISPONIBLES,
  formatearFecha,
  proximaFechaLibre,
} from "../utils/fechas";
import { Especialidad, Medico } from "../types/usuario";

type Vista = "especialidad" | "medico" | "verificacion" | "fecha";

export default function Reservar() {
  const router = useRouter();

  const [vista, setVista] = useState<Vista>("especialidad");
  const [busqueda, setBusqueda] = useState("");
  const [especialidad, setEspecialidad] = useState<Especialidad | null>(null);
  const [medico, setMedico] = useState<Medico | null>(null);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [tempFecha, setTempFecha] = useState("");
  const [tempHora, setTempHora] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);
  const [exito, setExito] = useState(false);


  const listaFiltrada = especialidades.filter((e) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const paso = vista === "especialidad" ? 1 : vista === "medico" ? 2 : 3;

  const atras = () => {
    if (vista === "especialidad") router.back();
    else if (vista === "medico") setVista("especialidad");
    else if (vista === "verificacion") setVista("medico");
    else setVista("verificacion");
  };

  const elegirEspecialidad = (e: Especialidad) => {
    setEspecialidad(e);
    setVista("medico");
  };

  const elegirMedico = (m: Medico) => {
    setMedico(m);
    setFecha(formatearFecha(proximaFechaLibre(m.diasAdelante)));
    setHora(m.hora);
    setConsentimiento(false);
    setVista("verificacion");
  };

  const abrirCalendario = () => {
    setTempFecha(fecha);
    setTempHora(hora);
    setVista("fecha");
  };

  const confirmarFecha = () => {
    setFecha(tempFecha);
    setHora(tempHora);
    setVista("verificacion");
  };

  const reservar = () => {
    if (!especialidad || !medico) return;
    const usuario = obtenerUsuarioActual();

    agregarCita({
      id: Date.now().toString(),
      especialidad: especialidad.nombre,
      servicio: especialidad.servicio,
      medico: medico.nombre,
      consultorio: medico.consultorio,
      modalidad: medico.modalidad,
      fecha,
      hora,
      estado: "PENDIENTE",
      paciente: usuario ? usuario.nombre.toUpperCase() : "PACIENTE",
      centro: CENTRO,
    });
    setExito(true);
  };

  const cerrarExito = () => {
    setExito(false);
    router.replace("/home");
  };

  return (
    <View className="flex-1 bg-white">
      <Cabecera
        titulo={vista === "fecha" ? "Elegir Fecha y Hora" : "Reservar Cita"}
        onAtras={atras}
      />

      {/* ---------- Elegir fecha y hora ---------- */}
      {vista === "fecha" && (
        <ScrollView contentContainerClassName="pt-4 pb-10">
          <Calendario fechaElegida={tempFecha} onElegir={setTempFecha} />

          <View className="flex-row items-center px-4 py-3 border-t border-b border-gray-200 mt-2">
            <View className="w-5 h-5 rounded-full border-2 border-sky-700" />
            <Text className="ml-1 mr-3">Disponible</Text>
            <View className="w-5 h-5 rounded-full bg-gray-300" />
            <Text className="ml-1 mr-3">Agotado</Text>
            <View className="w-5 h-5 rounded-full bg-sky-700" />
            <Text className="ml-1">Elegido</Text>
          </View>

          <Text className="text-xl font-bold text-center my-3">Horas Disponibles</Text>
          <View className="flex-row flex-wrap px-3">
            {HORAS_DISPONIBLES.map((h) => (
              <Pressable
                key={h}
                onPress={() => setTempHora(h)}
                className={`px-3 py-2 rounded-lg border-2 border-sky-700 mr-2 mb-2 ${
                  tempHora === h ? "bg-sky-700" : "bg-white"
                }`}
              >
                <Text
                  className={`font-bold ${tempHora === h ? "text-white" : "text-sky-700"}`}
                >
                  {h}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="flex-row px-6 mt-4">
            <View className="flex-1 mr-2">
              <Boton
                titulo="Confirmar"
                onPress={confirmarFecha}
                deshabilitado={tempFecha === "" || tempHora === ""}
              />
            </View>
            <View className="flex-1 ml-2">
              <Boton titulo="Cancelar" variante="gris" onPress={() => setVista("verificacion")} />
            </View>
          </View>
        </ScrollView>
      )}

      {/* ---------- Pasos 1, 2 y 3 ---------- */}
      {vista !== "fecha" && (
        <ScrollView className="px-4 pt-3" contentContainerClassName="pb-10">
          <Text className="text-center font-bold text-sky-900 text-base">
            Centro de Atención:
          </Text>
          <Text className="text-center mb-4">{CENTRO}</Text>

          <PasosReserva paso={paso} />

          {/* Paso 1: especialidad */}
          {vista === "especialidad" && (
            <View>
              <Buscador
                valor={busqueda}
                onCambiar={setBusqueda}
                placeholder="Buscar especialidad..."
              />

              {listaFiltrada.map((e) => (
                <Pressable key={e.id} onPress={() => elegirEspecialidad(e)}>
                  <TarjetaInfo icono={e.icono}>
                    <Text className="text-base">{e.nombre}</Text>
                  </TarjetaInfo>
                </Pressable>
              ))}

              {listaFiltrada.length === 0 && (
                <Text className="text-center text-gray-500 mt-4">
                  No se encontraron especialidades
                </Text>
              )}
            </View>
          )}

          {/* Paso 2: médico */}
          {vista === "medico" && especialidad && (
            <View>
              <TarjetaInfo icono={especialidad.icono}>
                <Text className="text-base">{especialidad.nombre}</Text>
              </TarjetaInfo>
              <TarjetaInfo icono="pulse">
                <Text className="text-base">{especialidad.servicio}</Text>
              </TarjetaInfo>

              <Text className="text-xl font-bold text-center my-3 py-2 border-t border-b border-gray-200">
                Médicos disponibles
              </Text>

              {especialidad.medicos.map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => elegirMedico(m)}
                  className="flex-row bg-white rounded-xl shadow mb-4 overflow-hidden border border-gray-100"
                >
                  <View className="w-2 bg-sky-600" />
                  <View className="flex-1 p-3">
                    <View className="flex-row items-center">
                      <Ionicons name="person" size={18} color="#0369a1" />
                      <Text className="ml-2 font-bold">{m.nombre}</Text>
                    </View>
                    <Text className="text-sky-800 mt-1">
                      Cita Sugerida:{" "}
                      <Text className="text-black">
                        {formatearFecha(proximaFechaLibre(m.diasAdelante))} - {m.hora}
                      </Text>
                    </Text>
                    <Text className="text-sky-800">
                      Modalidad: <Text className="text-black font-bold">{m.modalidad}</Text>
                    </Text>
                  </View>
                  <View className="justify-center pr-3">
                    <Ionicons name="chevron-forward" size={24} color="#111827" />
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* Paso 3: verificación */}
          {vista === "verificacion" && especialidad && medico && (
            <View>
              <Text className="text-xl font-bold text-center mb-3">
                Verificación de Datos de la Cita
              </Text>

              <TarjetaInfo icono={especialidad.icono}>
                <Text className="text-base">{especialidad.nombre}</Text>
              </TarjetaInfo>
              <TarjetaInfo icono="pulse">
                <Text className="text-base">{especialidad.servicio}</Text>
              </TarjetaInfo>
              <TarjetaInfo icono="person">
                <Text className="text-base">{medico.nombre}</Text>
                <Text className="text-sky-800">
                  Consultorio: <Text className="font-bold">{medico.consultorio}</Text>
                </Text>
                <Text className="text-sky-800">
                  Modalidad: <Text className="font-bold">{medico.modalidad}</Text>
                </Text>
              </TarjetaInfo>

              <View className="flex-row items-center bg-cyan-50 rounded-xl p-4 mb-3">
                <Ionicons name="time-outline" size={34} color="#0369a1" />
                <View className="flex-1 ml-4">
                  <Text className="text-base font-bold">
                    {fecha} - {hora}
                  </Text>
                  <Text className="text-gray-600">Fecha y Hora de Cita</Text>
                </View>
                <Pressable
                  onPress={abrirCalendario}
                  className="bg-sky-600 rounded-full px-4 py-2"
                >
                  <Text className="text-white">Ver más</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={() => setConsentimiento(!consentimiento)}
                className="flex-row items-center my-3"
              >
                <Ionicons
                  name={consentimiento ? "checkbox" : "square-outline"}
                  size={28}
                  color="#0369a1"
                />
                <Text className="ml-2 text-sky-800 text-base">Consentimiento Informado</Text>
              </Pressable>

              <View className="flex-row mt-2">
                <View className="flex-1 mr-2">
                  <Boton
                    titulo="Reservar Cita"
                    onPress={reservar}
                    deshabilitado={!consentimiento}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Boton titulo="Cancelar" variante="gris" onPress={() => router.back()} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <ModalExito
        visible={exito}
        titulo="Reservar Cita"
        mensaje="Se ha reservado la cita correctamente"
        onCerrar={cerrarExito}
      />
    </View>
  );
}
