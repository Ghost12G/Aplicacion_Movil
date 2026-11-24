import { useCallback, useEffect, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import Text from "../components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import Cabecera from "../components/Cabecera";
import PasosReserva from "../components/PasosReserva";
import TarjetaInfo from "../components/TarjetaInfo";
import Calendario from "../components/Calendario";
import Buscador from "../components/Buscador";
import ModalExito from "../components/ModalExito";
import Boton from "../components/Boton";
import { CENTRO } from "../../domain/constantes";
import {
  citaFirestoreSyncService,
  citaService,
  notificacionCitaService,
} from "../../infrastructure/container";
import { HORAS_DISPONIBLES } from "../../shared/fechas";
import { Especialidad, Medico } from "../../domain/entities/Especialidad";
import { Cita, mismaEspecialidad } from "../../domain/entities/Cita";
import { mensajeDeError } from "../../shared/errores";

type NombreIcono = keyof typeof Ionicons.glyphMap;

type Vista = "especialidad" | "medico" | "verificacion" | "fecha";

export default function ReservarCitaScreen() {
  const router = useRouter();
  const parametros = useLocalSearchParams<{ citaId?: string }>();
  const citaId = Array.isArray(parametros.citaId)
    ? parametros.citaId[0]
    : parametros.citaId;

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
  const [aviso, setAviso] = useState<{
    titulo: string;
    mensaje: string;
    tipo: "error" | "informacion";
    textoAccion?: string;
    accion?: () => void;
  } | null>(null);
  const [mensajeExito, setMensajeExito] = useState(
    "La cita se guardó en este dispositivo."
  );
  const [reservando, setReservando] = useState(false);
  const [sugerencias, setSugerencias] = useState<
    Record<string, { fecha: string; hora: string }>
  >({});
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [errorSugerencias, setErrorSugerencias] = useState("");
  const [intentoSugerencias, setIntentoSugerencias] = useState(0);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [cargandoEspecialidades, setCargandoEspecialidades] = useState(true);
  const [errorEspecialidades, setErrorEspecialidades] = useState("");
  const [intentoEspecialidades, setIntentoEspecialidades] = useState(0);
  const [citasPaciente, setCitasPaciente] = useState<Cita[]>([]);
  const [cargandoCitasPaciente, setCargandoCitasPaciente] = useState(true);
  const [errorCitasPaciente, setErrorCitasPaciente] = useState("");
  const [sinConexionCitas, setSinConexionCitas] = useState(false);
  const [sincronizacionPendienteCitas, setSincronizacionPendienteCitas] =
    useState(false);
  const [citasVerificadasEnNube, setCitasVerificadasEnNube] = useState(false);
  const [citaOriginal, setCitaOriginal] = useState<Cita | null>(null);
  const [errorReprogramacion, setErrorReprogramacion] = useState("");
  const [horasNoDisponibles, setHorasNoDisponibles] = useState<string[]>([]);
  const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState(false);
  const [errorDisponibilidad, setErrorDisponibilidad] = useState("");
  const [intentoDisponibilidad, setIntentoDisponibilidad] = useState(0);

  useEffect(() => {
    let activo = true;
    citaService
      .obtenerEspecialidades()
      .then((datos) => {
        if (activo) setEspecialidades(datos);
      })
      .catch((error: unknown) => {
        if (activo) setErrorEspecialidades(mensajeDeError(error));
      })
      .finally(() => {
        if (activo) setCargandoEspecialidades(false);
      });

    return () => {
      activo = false;
    };
  }, [intentoEspecialidades]);

  const cargarCitasPaciente = useCallback(async () => {
    setCargandoCitasPaciente(true);
    setErrorCitasPaciente("");
    setSinConexionCitas(false);
    setSincronizacionPendienteCitas(false);
    setCitasVerificadasEnNube(false);

    try {
      const resultado = await citaFirestoreSyncService.sincronizarPendientes();
      const citas = await citaService.listar();
      setCitasPaciente(citas);
      setCitasVerificadasEnNube(resultado.estado === "completa");
      setSinConexionCitas(resultado.estado === "sin-conexion");
      setSincronizacionPendienteCitas(resultado.estado === "pendiente");
      if (resultado.estado === "sin-sesion") {
        setErrorCitasPaciente("Inicia sesión para consultar y reservar citas.");
      }
    } catch (error) {
      setErrorCitasPaciente(mensajeDeError(error));
      try {
        setCitasPaciente(await citaService.listar());
      } catch (errorLocal) {
        setErrorCitasPaciente(
          `${mensajeDeError(error)} No se pudieron leer las citas locales: ${mensajeDeError(errorLocal)}`
        );
      }
    } finally {
      setCargandoCitasPaciente(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargarCitasPaciente();
    }, [cargarCitasPaciente])
  );

  useEffect(() => {
    if (!citaId) return;
    if (errorEspecialidades !== "") {
      return;
    }
    if (especialidades.length === 0) return;

    let activo = true;
    const cargarCita = async () => {
      try {
        const cita = (await citaService.listar()).find((existente) => existente.id === citaId);
        if (!cita) throw new Error("No se encontró la cita que quieres reprogramar.");

        const especialidadEncontrada = especialidades.find((existente) =>
          mismaEspecialidad(cita, {
            especialidadId: existente.id,
            especialidad: existente.nombre,
          })
        );
        const medicoEncontrado = especialidadEncontrada?.medicos.find(
          (existente) => existente.id === cita.medicoId
        );
        if (!especialidadEncontrada || !medicoEncontrado) {
          throw new Error(
            "No se encontró la especialidad o el médico de esta cita en el catálogo actual."
          );
        }

        if (!activo) return;
        setCitaOriginal(cita);
        setEspecialidad(especialidadEncontrada);
        setMedico(medicoEncontrado);
        setFecha(cita.fecha);
        setHora(cita.hora);
        setTempFecha(cita.fecha);
        setTempHora(cita.hora);
        setConsentimiento(true);
        setVista("verificacion");
      } catch (error) {
        if (activo) setErrorReprogramacion(mensajeDeError(error));
      }
    };

    void cargarCita();
    return () => {
      activo = false;
    };
  }, [citaId, especialidades, errorEspecialidades]);

  useEffect(() => {
    if (vista !== "medico" || !especialidad) return;

    let activo = true;
    const cargarSugerencias = async () => {
      try {
        const resultados = await Promise.all(
          especialidad.medicos.map(async (m) => [m.id, await citaService.sugerirHorario(m)] as const)
        );
        if (activo) setSugerencias(Object.fromEntries(resultados));
      } catch (error) {
        if (activo) setErrorSugerencias(mensajeDeError(error));
      } finally {
        if (activo) setCargandoSugerencias(false);
      }
    };

    void cargarSugerencias();
    return () => {
      activo = false;
    };
  }, [vista, especialidad, intentoSugerencias]);

  useEffect(() => {
    if (!medico || !tempFecha) {
      return;
    }

    let activo = true;
    citaService
      .horasNoDisponibles(medico.id, tempFecha, citaId)
      .then((horas) => {
        if (activo) setHorasNoDisponibles(horas);
      })
      .catch((error: unknown) => {
        if (activo) setErrorDisponibilidad(mensajeDeError(error));
      })
      .finally(() => {
        if (activo) setCargandoDisponibilidad(false);
      });

    return () => {
      activo = false;
    };
  }, [citaId, medico, tempFecha, intentoDisponibilidad]);

  // Buscador: se queda con las especialidades que contienen lo escrito
  const listaFiltrada = especialidades.filter((e) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const textoSugerido = (m: Medico) => {
    const sugerido = sugerencias[m.id];
    return sugerido
      ? `${sugerido.fecha} - ${sugerido.hora}`
      : cargandoSugerencias
        ? "Consultando disponibilidad..."
        : "Disponibilidad no disponible";
  };

  const paso = vista === "especialidad" ? 1 : vista === "medico" ? 2 : 3;

  const atras = () => {
    if (citaId) {
      if (vista === "fecha") setVista("verificacion");
      else router.back();
      return;
    }

    if (vista === "especialidad") router.back();
    else if (vista === "medico") setVista("especialidad");
    else if (vista === "verificacion") setVista("medico");
    else setVista("verificacion");
  };

  const elegirEspecialidad = (e: Especialidad) => {
    setEspecialidad(e);
    setCargandoSugerencias(true);
    setErrorSugerencias("");
    setVista("medico");
  };

  const seleccionarEspecialidad = (e: Especialidad) => {
    const citaActiva = citasPaciente.find((cita) =>
      mismaEspecialidad(cita, {
        especialidadId: e.id,
        especialidad: e.nombre,
      })
    );
    if (!citaActiva) {
      elegirEspecialidad(e);
      return;
    }

    setAviso({
      titulo: "Ya tienes una cita en esta especialidad",
      mensaje: `Cancela o reprograma la cita del ${citaActiva.fecha} a las ${citaActiva.hora} antes de reservar otra.`,
      tipo: "informacion",
      textoAccion: "Ver mis citas",
      accion: () => router.push("/citas"),
    });
  };

  const elegirMedico = (m: Medico) => {
    const sugerido = sugerencias[m.id];
    if (!sugerido) {
      setAviso({
        titulo: "No se pudo consultar",
        mensaje: "Vuelve a intentar consultar los horarios.",
        tipo: "error",
      });
      return;
    }

    setMedico(m);
    setFecha(sugerido.fecha);
    setHora(sugerido.hora);
    setConsentimiento(false);
    setVista("verificacion");
  };

  const abrirCalendario = () => {
    setTempFecha(fecha);
    setTempHora(hora);
    setCargandoDisponibilidad(true);
    setErrorDisponibilidad("");
    setVista("fecha");
  };

  const confirmarFecha = () => {
    setFecha(tempFecha);
    setHora(tempHora);
    setVista("verificacion");
  };

  const reservar = async () => {
    if (!especialidad || !medico) return;
    if (!citaId && !citasVerificadasEnNube) {
      setAviso({
        titulo: "Conexión necesaria",
        mensaje:
          "Conéctate a internet y actualiza tus citas antes de confirmar una reserva nueva.",
        tipo: "informacion",
      });
      return;
    }

    setReservando(true);
    try {
      const resultado = citaId
        ? await citaService.reprogramar(citaId, especialidad.id, fecha, hora)
        : await citaService.reservar({ especialidad, medico, fecha, hora });

      if (resultado.ok) {
        const citaGuardada = resultado.cita;
        if (!citaId) {
          try {
            await citaFirestoreSyncService.confirmarReserva(citaGuardada);
          } catch (error) {
            try {
              await citaService.cancelar(citaGuardada.id);
            } catch (errorAlRevertir) {
              setCitasVerificadasEnNube(false);
              throw new Error(
                `${mensajeDeError(error)} No se pudo revertir la reserva local: ${mensajeDeError(errorAlRevertir)}`
              );
            }
            setCitasVerificadasEnNube(false);
            throw error;
          }
        }

        const descripcionAccion = citaId
          ? "La cita se reprogramó correctamente."
          : "La cita se confirmó y quedó guardada en tu cuenta.";
        setMensajeExito(`${descripcionAccion} Estamos preparando el recordatorio...`);
        setExito(true);
        void (async () => {
          const mensajes = [descripcionAccion];
          try {
            const recordatorio = await notificacionCitaService.programarRecordatorio(
              citaGuardada
            );
            switch (recordatorio.estado) {
              case "programado":
                mensajes.push("Recibirás un recordatorio 24 horas antes.");
                break;
              case "permiso-denegado":
                mensajes.push("No se programó el recordatorio porque no concediste permiso.");
                break;
              case "menos-de-24-horas":
                mensajes.push("No se programó el recordatorio porque faltan menos de 24 horas.");
                break;
              case "no-disponible":
                mensajes.push("Los recordatorios locales no están disponibles en esta plataforma.");
                break;
              case "error":
                mensajes.push(
                  "No se pudo programar el recordatorio en esta ejecución de la app. La reserva sí quedó confirmada."
                );
                break;
            }
          } catch (error) {
            mensajes.push(
              `No se pudo programar el recordatorio: ${mensajeDeError(error)}`
            );
          }

          try {
            const sincronizacion =
              await citaFirestoreSyncService.sincronizarPendientes();
            mensajes.push(
              sincronizacion.estado === "completa"
                ? "Tus citas ya están actualizadas en tus dispositivos."
                : "El cambio quedó guardado en este teléfono y se actualizará en tus otros dispositivos cuando vuelva la conexión."
            );
          } catch (error) {
            mensajes.push(
              `El cambio quedó guardado en este teléfono, pero no se pudo actualizar en tus otros dispositivos. Revisa tu conexión e inténtalo más tarde. Detalle: ${mensajeDeError(error)}`
            );
          }
          setMensajeExito(mensajes.join(" "));
        })();
      } else {
        setAviso({
          titulo: citaId ? "No se pudo reprogramar" : "No se pudo reservar",
          mensaje: resultado.motivo,
          tipo: "error",
        });
      }
    } catch (error) {
      setAviso({
        titulo: citaId ? "No se pudo reprogramar" : "No se pudo reservar",
        mensaje: mensajeDeError(error),
        tipo: "error",
      });
    } finally {
      setReservando(false);
    }
  };

  const cerrarExito = () => {
    setExito(false);
    router.replace("/home");
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <Cabecera
        titulo={
          vista === "fecha"
            ? "Elegir Fecha y Hora"
            : citaId
              ? "Reprogramar Cita"
              : "Reservar Cita"
        }
        onAtras={atras}
      />

      {citaId && !citaOriginal && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sky-800">
            {errorReprogramacion ||
              (errorEspecialidades !== ""
                ? `No se pudo cargar la información necesaria para reprogramar: ${errorEspecialidades}`
                : "Preparando la cita para reprogramar...")}
          </Text>
          {errorReprogramacion !== "" && (
            <Pressable onPress={() => router.back()} className="mt-4">
              <Text className="font-bold text-sky-800">Volver a mis citas</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* ---------- Elegir fecha y hora ---------- */}
      {(!citaId || citaOriginal) && vista === "fecha" && (
        <ScrollView contentContainerClassName="pt-4 pb-10">
          <Calendario
            fechaElegida={tempFecha}
            onElegir={(f) => {
              setTempFecha(f);
              setTempHora(""); // al cambiar de día se vuelve a elegir la hora
              setCargandoDisponibilidad(true);
              setErrorDisponibilidad("");
              setHorasNoDisponibles([]);
            }}
          />

          <View className="flex-row items-center px-4 py-3 border-t border-b border-gray-200 mt-2">
            <View className="w-5 h-5 rounded-full border-2 border-sky-700" />
            <Text className="ml-1 mr-3">Disponible</Text>
            <View className="w-5 h-5 rounded-full bg-gray-300" />
            <Text className="ml-1 mr-3">Agotado</Text>
            <View className="w-5 h-5 rounded-full bg-sky-700" />
            <Text className="ml-1">Elegido</Text>
          </View>

          <Text className="text-xl font-bold text-center mt-3">Horas Disponibles</Text>
          <Text className="text-center text-gray-500 text-xs mb-3">
            Las horas en gris ya pasaron o están ocupadas
          </Text>
          {cargandoDisponibilidad && (
            <Text className="text-center text-sky-800 my-3">Consultando horarios...</Text>
          )}
          {errorDisponibilidad !== "" && (
            <View className="items-center mb-3">
              <Text className="text-center text-red-600">{errorDisponibilidad}</Text>
              <Pressable
                onPress={() => {
                  setCargandoDisponibilidad(true);
                  setErrorDisponibilidad("");
                  setIntentoDisponibilidad((n) => n + 1);
                }}
              >
                <Text className="text-sky-800 font-bold mt-2">Reintentar</Text>
              </Pressable>
            </View>
          )}
          <View className="flex-row flex-wrap px-3">
            {HORAS_DISPONIBLES.map((h) => {
              const noDisponible = horasNoDisponibles.includes(h);
              const elegida = tempHora === h;

              let fondo = "bg-white dark:bg-slate-900 border-sky-700 dark:border-sky-400";
              let colorTexto = "text-sky-700";
              if (noDisponible) {
                fondo = "bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600";
                colorTexto = "text-gray-400";
              } else if (elegida) {
                fondo = "bg-sky-700 border-sky-700 dark:border-sky-400";
                colorTexto = "text-white";
              }

              return (
                <Pressable
                  key={h}
                  disabled={
                    noDisponible || cargandoDisponibilidad || errorDisponibilidad !== ""
                  }
                  onPress={() => setTempHora(h)}
                  className={`px-3 py-2 rounded-lg border-2 mr-2 mb-2 ${fondo}`}
                >
                  <Text className={`font-bold ${colorTexto}`}>{h}</Text>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row px-6 mt-4">
            <View className="flex-1 mr-2">
              <Boton
                titulo="Confirmar"
                onPress={confirmarFecha}
                deshabilitado={
                  tempFecha === "" ||
                  tempHora === "" ||
                  cargandoDisponibilidad ||
                  errorDisponibilidad !== ""
                }
              />
            </View>
            <View className="flex-1 ml-2">
              <Boton titulo="Cancelar" variante="gris" onPress={() => setVista("verificacion")} />
            </View>
          </View>
        </ScrollView>
      )}

      {/* ---------- Pasos 1, 2 y 3 ---------- */}
      {(!citaId || citaOriginal) && vista !== "fecha" && (
        <ScrollView className="px-4 pt-3" contentContainerClassName="pb-10">
          <Text className="text-center font-bold text-sky-900 text-base">
            Centro de Atención:
          </Text>
          <Text className="text-center mb-4">{CENTRO}</Text>

          <PasosReserva paso={paso} />

          {/* Paso 1: especialidad */}
          {vista === "especialidad" && (
            <View>
              {cargandoEspecialidades && (
                <Text className="text-center text-sky-800 my-4">
                  Cargando especialidades...
                </Text>
              )}

              {errorEspecialidades !== "" && (
                <View className="items-center mt-4">
                  <Text className="text-center text-red-600">{errorEspecialidades}</Text>
                  <Pressable
                    onPress={() => {
                      setCargandoEspecialidades(true);
                      setErrorEspecialidades("");
                      setIntentoEspecialidades((n) => n + 1);
                    }}
                  >
                    <Text className="text-sky-800 font-bold mt-2">Reintentar</Text>
                  </Pressable>
                </View>
              )}

              {cargandoCitasPaciente && (
                <Text className="text-center text-sky-800 my-3">
                  Verificando tus citas...
                </Text>
              )}
              {errorCitasPaciente !== "" && (
                <View className="items-center mt-3">
                  <Text className="text-center text-red-600">
                    No se pudo verificar si ya tienes una cita en estas especialidades:{" "}
                    {errorCitasPaciente}
                  </Text>
                  <Pressable
                    onPress={() => {
                      void cargarCitasPaciente();
                    }}
                  >
                    <Text className="text-sky-800 font-bold mt-2">Reintentar</Text>
                  </Pressable>
                </View>
              )}
              {sinConexionCitas && errorCitasPaciente === "" && (
                <View className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3">
                  <Text className="text-center text-amber-900">
                    Sin internet. Puedes consultar las citas guardadas en este teléfono,
                    pero debes reconectarte para confirmar una reserva nueva.
                  </Text>
                </View>
              )}
              {sincronizacionPendienteCitas && errorCitasPaciente === "" && (
                <View className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3">
                  <Text className="text-center text-amber-900">
                    Hay cambios de citas que todavía no se confirmaron en Firestore.
                    Sincroniza o resuelve la cita pendiente antes de reservar otra.
                  </Text>
                </View>
              )}

              {!cargandoEspecialidades && errorEspecialidades === "" && (
                <>
                  <Buscador
                    valor={busqueda}
                    onCambiar={setBusqueda}
                    placeholder="Buscar especialidad..."
                  />

                  {listaFiltrada.map((e) => {
                    const citaActiva = citasPaciente.find((cita) =>
                      mismaEspecialidad(cita, {
                        especialidadId: e.id,
                        especialidad: e.nombre,
                      })
                    );
                    const bloqueada = Boolean(citaActiva);

                    return (
                      <Pressable
                        key={e.id}
                        disabled={
                          cargandoCitasPaciente ||
                          errorCitasPaciente !== "" ||
                          (!citaId && !citasVerificadasEnNube)
                        }
                        onPress={() => seleccionarEspecialidad(e)}
                      >
                        <View className={bloqueada ? "opacity-50" : ""}>
                          <TarjetaInfo icono={e.icono as NombreIcono}>
                            <View className="flex-row items-center justify-between">
                              <Text className="text-base">{e.nombre}</Text>
                              {bloqueada && (
                                <Ionicons name="lock-closed" size={18} color="#b91c1c" />
                              )}
                            </View>
                            {bloqueada && (
                              <Text className="text-sm font-bold text-red-700 mt-1">
                                Ya tienes una cita activa en esta especialidad
                              </Text>
                            )}
                          </TarjetaInfo>
                        </View>
                      </Pressable>
                    );
                  })}

                  {listaFiltrada.length === 0 && (
                    <Text className="text-center text-gray-500 mt-4">
                      No se encontraron especialidades
                    </Text>
                  )}
                </>
              )}
            </View>
          )}

          {/* Paso 2: médico */}
          {vista === "medico" && especialidad && (
            <View>
              <TarjetaInfo icono={especialidad.icono as NombreIcono}>
                <Text className="text-base">{especialidad.nombre}</Text>
              </TarjetaInfo>
              <TarjetaInfo icono="pulse">
                <Text className="text-base">{especialidad.servicio}</Text>
              </TarjetaInfo>

              <Text className="text-xl font-bold text-center my-3 py-2 border-t border-b border-gray-200">
                Médicos disponibles
              </Text>

              {cargandoSugerencias && (
                <Text className="text-center text-sky-800 my-3">
                  Consultando horarios...
                </Text>
              )}
              {errorSugerencias !== "" && (
                <View className="items-center mb-3">
                  <Text className="text-center text-red-600">{errorSugerencias}</Text>
                  <Pressable
                    onPress={() => {
                      setCargandoSugerencias(true);
                      setErrorSugerencias("");
                      setIntentoSugerencias((n) => n + 1);
                    }}
                  >
                    <Text className="text-sky-800 font-bold mt-2">Reintentar</Text>
                  </Pressable>
                </View>
              )}

              {especialidad.medicos.map((m) => (
                <Pressable
                  key={m.id}
                  disabled={cargandoSugerencias || errorSugerencias !== ""}
                  onPress={() => elegirMedico(m)}
                  className="flex-row bg-white dark:bg-slate-900 rounded-xl shadow mb-4 overflow-hidden border border-gray-100 dark:border-slate-700"
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
                        {textoSugerido(m)}
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

              <TarjetaInfo icono={especialidad.icono as NombreIcono}>
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

              <View className="flex-row items-center bg-cyan-50 dark:bg-slate-800 rounded-xl p-4 mb-3">
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
                    titulo={
                      reservando
                        ? citaId
                          ? "Reprogramando cita..."
                          : "Guardando cita..."
                        : citaId
                          ? "Reprogramar Cita"
                          : "Reservar Cita"
                    }
                    onPress={reservar}
                    deshabilitado={
                      !consentimiento ||
                      reservando ||
                      (!citaId && !citasVerificadasEnNube)
                    }
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

      {(!citaId || citaOriginal) && (
        <ModalExito
          visible={exito}
          titulo={citaId ? "Reprogramar Cita" : "Reservar Cita"}
          mensaje={mensajeExito}
          onCerrar={cerrarExito}
        />
      )}
      <ModalExito
        visible={aviso !== null}
        titulo={aviso?.titulo ?? ""}
        mensaje={aviso?.mensaje ?? ""}
        tipo={aviso?.tipo ?? "informacion"}
        textoAccion={aviso?.textoAccion ?? "Entendido"}
        onCerrar={() => setAviso(null)}
        onAccion={
          aviso?.accion
            ? () => {
                const accion = aviso.accion;
                setAviso(null);
              if (accion) accion();
              }
            : undefined
        }
        textoSecundario="Cerrar"
      />
    </View>
  );
}
