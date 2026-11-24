import { Cita } from "../entities/Cita";

export type ResultadoAgregarCita =
  | { ok: true }
  | {
      ok: false;
      motivo: "especialidad-ya-tiene-cita" | "horario-lleno" | "cita-duplicada";
    };

export type ResultadoReprogramarCita =
  | { ok: true; cita: Cita }
  | {
      ok: false;
      motivo: "cita-no-encontrada" | "cita-duplicada" | "horario-lleno";
    };

export interface CitaPendienteSincronizacion {
  id: number;
  citaId: string;
  usuarioUid: string;
  accion: "guardar" | "eliminar";
  cita: Cita | null;
}

export interface CitaRepository {
  agregarSiDisponible(cita: Cita, cuposMaximos: number): Promise<ResultadoAgregarCita>;
  reprogramarSiDisponible(
    id: string,
    usuarioUid: string,
    pacienteDni: string,
    especialidadId: string,
    fecha: string,
    hora: string,
    cuposMaximos: number
  ): Promise<ResultadoReprogramarCita>;
  listar(): Promise<Cita[]>;
  eliminar(id: string, usuarioUid: string): Promise<void>;
  sincronizarDesdeFirestore(usuarioUid: string, citas: Cita[]): Promise<void>;
  prepararSincronizacion(
    usuarioUid: string,
    pacienteDni: string,
    citasRemotasIds: string[]
  ): Promise<void>;
  listarPendientesSincronizacion(usuarioUid: string): Promise<CitaPendienteSincronizacion[]>;
  confirmarPendienteSincronizacion(id: number): Promise<void>;
}
