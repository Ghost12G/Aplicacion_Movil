import type { Cita } from "../../domain/entities/Cita";
import type { ResultadoRecordatorio } from "./NotificacionCitaService.types";

export class NotificacionCitaService {
  async programarRecordatorio(_cita: Cita): Promise<ResultadoRecordatorio> {
    return { estado: "no-disponible" };
  }

  cancelarRecordatorio(_citaId: string): Promise<void> {
    return Promise.resolve();
  }
}
