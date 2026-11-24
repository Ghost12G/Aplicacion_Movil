import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Cita } from "../../domain/entities/Cita";
import {
  citaFirestoreSyncService,
  citaService,
  notificacionCitaService,
} from "../../infrastructure/container";
import { mensajeDeError } from "../../shared/errores";

// Carga las citas al entrar en la pantalla y permite cancelarlas
export function useCitas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");

    let avisoSincronizacion = "";
    try {
      const resultado = await citaFirestoreSyncService.sincronizarPendientes();
      if (resultado.estado === "sin-conexion") {
        avisoSincronizacion =
          resultado.pendientes > 0
            ? "Sin internet: las citas descargadas siguen disponibles, pero las cancelaciones pendientes no se han sincronizado."
            : "Sin internet: se muestran las citas guardadas en este teléfono; podrían faltar cambios de otros dispositivos.";
      } else if (resultado.estado === "pendiente") {
        avisoSincronizacion =
          "Hay cambios de citas pendientes de confirmar en Firestore. Revisa la conexión o resuelve la cita pendiente antes de continuar.";
      } else if (resultado.estado === "sin-sesion") {
        avisoSincronizacion = "Inicia sesión para consultar tus citas.";
      }
    } catch (error) {
      avisoSincronizacion = `No se pudieron actualizar las citas desde Firestore: ${mensajeDeError(error)}`;
    }

    try {
      setCitas(await citaService.listar());
      if (avisoSincronizacion) setError(avisoSincronizacion);
    } catch (error) {
      setError(
        avisoSincronizacion
          ? `${avisoSincronizacion} Además, no se pudieron leer las citas locales: ${mensajeDeError(error)}`
          : mensajeDeError(error)
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar])
  );

  const cancelar = async (id: string) => {
    setError("");
    try {
      await citaService.cancelar(id);
      let avisoRecordatorio = "";
      try {
        await notificacionCitaService.cancelarRecordatorio(id);
      } catch (error) {
        avisoRecordatorio = `La cita se canceló, pero no se pudo quitar el recordatorio: ${mensajeDeError(error)}`;
      }
      await cargar();
      if (avisoRecordatorio) {
        setError((actual) => [actual, avisoRecordatorio].filter(Boolean).join(" "));
      }
    } catch (error) {
      setError(mensajeDeError(error));
    }
  };

  return { citas, cargando, error, cargar, cancelar };
}
