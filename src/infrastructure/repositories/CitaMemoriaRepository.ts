import { Cita, mismaEspecialidad } from "../../domain/entities/Cita";
import {
  CitaPendienteSincronizacion,
  CitaRepository,
  ResultadoAgregarCita,
  ResultadoReprogramarCita,
} from "../../domain/repositories/CitaRepository";

export class CitaMemoriaRepository implements CitaRepository {
  private citas: Cita[] = [];
  private pendientes: CitaPendienteSincronizacion[] = [];
  private siguienteIdPendiente = 1;

  async agregarSiDisponible(
    cita: Cita,
    cuposMaximos: number
  ): Promise<ResultadoAgregarCita> {
    const pacienteTieneCitaEnEspecialidad = this.citas.some(
      (existente) =>
        existente.pacienteDni === cita.pacienteDni &&
        mismaEspecialidad(existente, cita)
    );
    if (pacienteTieneCitaEnEspecialidad) {
      return { ok: false, motivo: "especialidad-ya-tiene-cita" };
    }

    const pacienteTieneCita = this.citas.some(
      (existente) =>
        existente.pacienteDni === cita.pacienteDni &&
        existente.fecha === cita.fecha &&
        existente.hora === cita.hora
    );
    if (pacienteTieneCita) return { ok: false, motivo: "cita-duplicada" };

    const citasEnHorario = this.citas.filter(
      (existente) =>
        existente.medicoId === cita.medicoId &&
        existente.fecha === cita.fecha &&
        existente.hora === cita.hora
    ).length;
    if (citasEnHorario >= cuposMaximos) return { ok: false, motivo: "horario-lleno" };

    this.citas.push(cita);
    if (cita.pacienteUid) {
      this.encolar(cita.id, cita.pacienteUid, "guardar", cita);
    }
    return { ok: true };
  }

  async listar(): Promise<Cita[]> {
    return [...this.citas];
  }

  async reprogramarSiDisponible(
    id: string,
    usuarioUid: string,
    pacienteDni: string,
    especialidadId: string,
    fecha: string,
    hora: string,
    cuposMaximos: number
  ): Promise<ResultadoReprogramarCita> {
    const cita = this.citas.find((existente) => existente.id === id);
    if (!cita) return { ok: false, motivo: "cita-no-encontrada" };
    if (
      (cita.pacienteUid && cita.pacienteUid !== usuarioUid) ||
      (!cita.pacienteUid && cita.pacienteDni !== pacienteDni)
    ) {
      throw new Error("No puedes reprogramar una cita de otra cuenta.");
    }

    const citaDuplicada = this.citas.some(
      (existente) =>
        existente.id !== id &&
        existente.pacienteDni === pacienteDni &&
        existente.fecha === fecha &&
        existente.hora === hora
    );
    if (citaDuplicada) return { ok: false, motivo: "cita-duplicada" };

    const citasEnHorario = this.citas.filter(
      (existente) =>
        existente.id !== id &&
        existente.medicoId === cita.medicoId &&
        existente.fecha === fecha &&
        existente.hora === hora
    ).length;
    if (citasEnHorario >= cuposMaximos) {
      return { ok: false, motivo: "horario-lleno" };
    }

    const citaActualizada = {
      ...cita,
      pacienteUid: usuarioUid,
      especialidadId,
      fecha,
      hora,
    };
    this.citas = this.citas.map((existente) =>
      existente.id === id ? citaActualizada : existente
    );
    this.encolar(id, usuarioUid, "guardar", citaActualizada);
    return { ok: true, cita: citaActualizada };
  }

  async eliminar(id: string, usuarioUid: string): Promise<void> {
    const cita = this.citas.find((existente) => existente.id === id);
    if (!cita) return;
    if (cita.pacienteUid && cita.pacienteUid !== usuarioUid) {
      throw new Error("No puedes cancelar una cita de otra cuenta.");
    }

    this.encolar(id, usuarioUid, "eliminar", cita);
    this.citas = this.citas.filter((existente) => existente.id !== id);
  }

  async sincronizarDesdeFirestore(usuarioUid: string, citasRemotas: Cita[]): Promise<void> {
    const pendientes = new Set(
      this.pendientes
        .filter((pendiente) => pendiente.usuarioUid === usuarioUid)
        .map((pendiente) => pendiente.citaId)
    );
    const idsRemotos = new Set(citasRemotas.map((cita) => cita.id));

    this.citas = this.citas.filter(
      (cita) =>
        cita.pacienteUid !== usuarioUid ||
        pendientes.has(cita.id) ||
        idsRemotos.has(cita.id)
    );

    for (const cita of citasRemotas) {
      if (pendientes.has(cita.id)) continue;
      const posicion = this.citas.findIndex((existente) => existente.id === cita.id);
      if (posicion === -1) {
        this.citas.push(cita);
        continue;
      }

      const existente = this.citas[posicion];
      if (
        (existente.pacienteUid && existente.pacienteUid !== usuarioUid) ||
        (!existente.pacienteUid && existente.pacienteDni !== cita.pacienteDni)
      ) {
        throw new Error(
          `No se pudo importar la cita ${cita.id}: el identificador ya pertenece a otra cuenta.`
        );
      }
      this.citas[posicion] = cita;
    }
  }

  async prepararSincronizacion(
    usuarioUid: string,
    pacienteDni: string,
    citasRemotasIds: string[]
  ): Promise<void> {
    const remotas = new Set(citasRemotasIds);
    this.citas = this.citas.map((cita) => {
      if (
        (cita.pacienteUid && cita.pacienteUid !== usuarioUid) ||
        (!cita.pacienteUid && cita.pacienteDni !== pacienteDni)
      ) {
        return cita;
      }

      const citaActualizada = cita.pacienteUid
        ? cita
        : { ...cita, pacienteUid: usuarioUid };
      const yaPendiente = this.pendientes.some(
        (pendiente) =>
          pendiente.usuarioUid === usuarioUid && pendiente.citaId === cita.id
      );
      if (!remotas.has(cita.id) && !yaPendiente) {
        this.encolar(cita.id, usuarioUid, "guardar", citaActualizada);
      }
      return citaActualizada;
    });
  }

  async listarPendientesSincronizacion(
    usuarioUid: string
  ): Promise<CitaPendienteSincronizacion[]> {
    return this.pendientes.filter((pendiente) => pendiente.usuarioUid === usuarioUid);
  }

  async confirmarPendienteSincronizacion(id: number): Promise<void> {
    this.pendientes = this.pendientes.filter((pendiente) => pendiente.id !== id);
  }

  private encolar(
    citaId: string,
    usuarioUid: string,
    accion: "guardar" | "eliminar",
    cita: Cita | null
  ): void {
    this.pendientes = this.pendientes.filter(
      (pendiente) =>
        pendiente.citaId !== citaId || pendiente.usuarioUid !== usuarioUid
    );
    this.pendientes.push({
      id: this.siguienteIdPendiente++,
      citaId,
      usuarioUid,
      accion,
      cita,
    });
  }
}
