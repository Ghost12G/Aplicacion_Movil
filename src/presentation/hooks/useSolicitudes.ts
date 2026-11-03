import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Solicitud } from "../../domain/entities/Solicitud";
import { solicitudService } from "../../infrastructure/container";

// Lista de solicitudes + eliminar. Se recarga cada vez que la pantalla
// vuelve a mostrarse (por ejemplo, después de editar una solicitud).
export function useSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(() =>
    solicitudService.listar()
  );

  useFocusEffect(
    useCallback(() => {
      setSolicitudes(solicitudService.listar());
    }, [])
  );

  const eliminar = (id: string) => {
    solicitudService.eliminar(id);
    setSolicitudes(solicitudService.listar());
  };

  return { solicitudes, eliminar };
}
