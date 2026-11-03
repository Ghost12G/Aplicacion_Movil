import { useState } from "react";
import { Cita } from "../../domain/entities/Cita";
import { citaService } from "../../infrastructure/container";

// Lista de citas programadas + cancelar
export function useCitas() {
  const [citas, setCitas] = useState<Cita[]>(() => citaService.listar());

  const cancelar = (id: string) => {
    citaService.cancelar(id);
    setCitas(citaService.listar());
  };

  return { citas, cancelar };
}
