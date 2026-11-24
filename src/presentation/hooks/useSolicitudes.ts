import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Solicitud } from "../../domain/entities/Solicitud";
import { solicitudService } from "../../infrastructure/container";
import { mensajeDeError } from "../../shared/errores";

export function useSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setSolicitudes(await solicitudService.listar());
    } catch (error) {
      setError(mensajeDeError(error));
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar])
  );

  const eliminar = async (id: string): Promise<void> => {
    setError("");
    try {
      await solicitudService.eliminar(id);
      await cargar();
    } catch (error) {
      setError(mensajeDeError(error));
      throw error;
    }
  };

  return { solicitudes, cargando, error, cargar, eliminar };
}
