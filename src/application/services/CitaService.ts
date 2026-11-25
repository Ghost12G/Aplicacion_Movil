import { Cita } from "../../domain/entities/Cita";
import { Especialidad, Medico } from "../../domain/entities/Especialidad";
import { CENTRO, CUPOS_POR_HORARIO } from "../../domain/constantes";
import { CitaRepository } from "../../domain/repositories/CitaRepository";
import { EspecialidadRepository } from "../../domain/repositories/EspecialidadRepository";
import { SesionRepository } from "../../domain/repositories/SesionRepository";
import {
  HORAS_DISPONIBLES,
  formatearFecha,
  proximaFechaLibre,
  yaPaso,
} from "../../shared/fechas";

export interface DatosReserva {
  especialidad: Especialidad;
  medico: Medico;
  fecha: string;
  hora: string;
}

export type ResultadoReserva =
  | { ok: true; cita: Cita }
  | { ok: false; motivo: string };

function generarIdCita(): string {
  const valorAleatorio = Math.floor(
    Math.random() * Number.MAX_SAFE_INTEGER
  ).toString(36);
  return `${Date.now().toString(36)}-${valorAleatorio}`;
}

export class CitaService {
  private citas: CitaRepository;
  private especialidades: EspecialidadRepository;
  private sesion: SesionRepository;

  constructor(
    citas: CitaRepository,
    especialidades: EspecialidadRepository,
    sesion: SesionRepository
  ) {
    this.citas = citas;
    this.especialidades = especialidades;
    this.sesion = sesion;
  }

  obtenerEspecialidades(): Promise<Especialidad[]> {
    return this.especialidades.obtenerTodas();
  }

  async listar(): Promise<Cita[]> {
    const usuario = this.sesion.obtenerUsuario();
    if (!usuario) return [];
    const citas = await this.citas.listar();
    return citas.filter(
      (c) =>
        c.pacienteUid === usuario.uid ||
        (!c.pacienteUid && c.pacienteDni === usuario.dni)
    );
  }

  private contarCitasEnHorario(
    citas: Cita[],
    medicoId: string,
    fecha: string,
    hora: string,
    excluirCitaId?: string
  ): number {
    return citas.filter(
      (c) =>
        c.id !== excluirCitaId &&
        c.medicoId === medicoId &&
        c.fecha === fecha &&
        c.hora === hora
    ).length;
  }

  async estaDisponible(medicoId: string, fecha: string, hora: string): Promise<boolean> {
    if (yaPaso(fecha, hora)) return false;
    const citas = await this.citas.listar();
    return this.contarCitasEnHorario(citas, medicoId, fecha, hora) < CUPOS_POR_HORARIO;
  }

  async horasNoDisponibles(
    medicoId: string,
    fecha: string,
    excluirCitaId?: string
  ): Promise<string[]> {
    const citas = await this.citas.listar();
    return HORAS_DISPONIBLES.filter(
      (hora) =>
        yaPaso(fecha, hora) ||
        this.contarCitasEnHorario(citas, medicoId, fecha, hora, excluirCitaId) >=
          CUPOS_POR_HORARIO
    );
  }

  async sugerirHorario(medico: Medico): Promise<{ fecha: string; hora: string }> {
    const citas = await this.citas.listar();
    for (let extra = 0; extra < 14; extra++) {
      const fecha = formatearFecha(proximaFechaLibre(medico.diasAdelante + extra));
      const hora = [medico.hora, ...HORAS_DISPONIBLES].find(
        (hora) =>
          !yaPaso(fecha, hora) &&
          this.contarCitasEnHorario(citas, medico.id, fecha, hora) < CUPOS_POR_HORARIO
      );
      if (hora) return { fecha, hora };
    }
    return { fecha: formatearFecha(proximaFechaLibre(medico.diasAdelante)), hora: medico.hora };
  }

  async reservar(datos: DatosReserva): Promise<ResultadoReserva> {
    const usuario = this.sesion.obtenerUsuario();
    if (!usuario) {
      return { ok: false, motivo: "Debes iniciar sesión para reservar una cita." };
    }

    if (yaPaso(datos.fecha, datos.hora)) {
      return { ok: false, motivo: "Esa fecha y hora ya pasaron. Elige un horario disponible." };
    }

    const cita: Cita = {
      id: generarIdCita(),
      pacienteUid: usuario.uid,
      medicoId: datos.medico.id,
      pacienteDni: usuario.dni,
      especialidadId: datos.especialidad.id,
      especialidad: datos.especialidad.nombre,
      servicio: datos.especialidad.servicio,
      medico: datos.medico.nombre,
      consultorio: datos.medico.consultorio,
      modalidad: datos.medico.modalidad,
      fecha: datos.fecha,
      hora: datos.hora,
      estado: "PENDIENTE",
      paciente: usuario.nombre.toUpperCase(),
      centro: CENTRO,
    };

    const resultado = await this.citas.agregarSiDisponible(cita, CUPOS_POR_HORARIO);
    if (!resultado.ok) {
      const motivo =
        resultado.motivo === "especialidad-ya-tiene-cita"
          ? "Ya tienes una cita activa en esta especialidad. Cancélala antes de reservar otra."
          : resultado.motivo === "cita-duplicada"
            ? "Ya tienes otra cita en esa fecha y hora."
            : "Ese horario ya fue reservado por otro paciente. Elige otra hora.";
      return { ok: false, motivo };
    }

    return { ok: true, cita };
  }

  async reprogramar(
    id: string,
    especialidadId: string,
    fecha: string,
    hora: string
  ): Promise<ResultadoReserva> {
    const usuario = this.sesion.obtenerUsuario();
    if (!usuario) {
      return { ok: false, motivo: "Debes iniciar sesión para reprogramar una cita." };
    }
    if (yaPaso(fecha, hora)) {
      return { ok: false, motivo: "Esa fecha y hora ya pasaron. Elige otro horario." };
    }

    const resultado = await this.citas.reprogramarSiDisponible(
      id,
      usuario.uid,
      usuario.dni,
      especialidadId,
      fecha,
      hora,
      CUPOS_POR_HORARIO
    );
    if (!resultado.ok) {
      const motivo =
        resultado.motivo === "cita-no-encontrada"
          ? "No se encontró tu cita. Actualiza la lista e inténtalo de nuevo."
          : resultado.motivo === "cita-duplicada"
            ? "Ya tienes otra cita en esa fecha y hora."
            : "Ese horario ya está lleno. Elige otro horario.";
      return { ok: false, motivo };
    }

    return { ok: true, cita: resultado.cita };
  }

  async cancelar(id: string): Promise<void> {
    const esPropia = (await this.listar()).some((c) => c.id === id);
    const usuario = this.sesion.obtenerUsuario();
    if (esPropia && usuario) await this.citas.eliminar(id, usuario.uid);
  }
}
