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

// Resultado de reservar: o se reservó, o se explica por qué no se pudo
export type ResultadoReserva =
  | { ok: true; cita: Cita }
  | { ok: false; motivo: string };

// Reservar, consultar y cancelar citas
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

  obtenerEspecialidades(): Especialidad[] {
    return this.especialidades.obtenerTodas();
  }

  // Solo las citas del paciente que inició sesión
  listar(): Cita[] {
    const usuario = this.sesion.obtenerUsuario();
    if (!usuario) return [];
    return this.citas.listar().filter((c) => c.pacienteDni === usuario.dni);
  }

  // Cuántas citas tiene ya un médico en esa fecha y hora (de todos los pacientes)
  private citasEnHorario(medicoId: string, fecha: string, hora: string): number {
    return this.citas
      .listar()
      .filter((c) => c.medicoId === medicoId && c.fecha === fecha && c.hora === hora).length;
  }

  // Un horario está disponible si no pasó y todavía hay cupo con ese médico
  estaDisponible(medicoId: string, fecha: string, hora: string): boolean {
    if (yaPaso(fecha, hora)) return false;
    return this.citasEnHorario(medicoId, fecha, hora) < CUPOS_POR_HORARIO;
  }

  // Horas que no se pueden elegir: ya pasaron o ya están ocupadas
  horasNoDisponibles(medicoId: string, fecha: string): string[] {
    return HORAS_DISPONIBLES.filter((h) => !this.estaDisponible(medicoId, fecha, h));
  }

  // Primer horario libre cercano a la cita sugerida del médico
  sugerirHorario(medico: Medico): { fecha: string; hora: string } {
    for (let extra = 0; extra < 14; extra++) {
      const fecha = formatearFecha(proximaFechaLibre(medico.diasAdelante + extra));
      const hora = [medico.hora, ...HORAS_DISPONIBLES].find((h) =>
        this.estaDisponible(medico.id, fecha, h)
      );
      if (hora) return { fecha, hora };
    }
    return { fecha: formatearFecha(proximaFechaLibre(medico.diasAdelante)), hora: medico.hora };
  }

  reservar(datos: DatosReserva): ResultadoReserva {
    const usuario = this.sesion.obtenerUsuario();
    if (!usuario) {
      return { ok: false, motivo: "Debes iniciar sesión para reservar una cita." };
    }

    // Regla 1: no se puede reservar en una hora que ya pasó
    if (yaPaso(datos.fecha, datos.hora)) {
      return { ok: false, motivo: "Esa fecha y hora ya pasaron. Elige un horario disponible." };
    }

    // Regla 2: el médico atiende a un número limitado de pacientes por horario
    if (this.citasEnHorario(datos.medico.id, datos.fecha, datos.hora) >= CUPOS_POR_HORARIO) {
      return { ok: false, motivo: "Ese horario ya fue reservado por otro paciente. Elige otra hora." };
    }

    // Regla 3: el paciente no puede tener dos citas a la misma fecha y hora
    const choque = this.citas
      .listar()
      .some((c) => c.pacienteDni === usuario.dni && c.fecha === datos.fecha && c.hora === datos.hora);
    if (choque) {
      return { ok: false, motivo: "Ya tienes otra cita en esa fecha y hora." };
    }

    const cita: Cita = {
      id: Date.now().toString(),
      medicoId: datos.medico.id,
      pacienteDni: usuario.dni,
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

    this.citas.agregar(cita);
    return { ok: true, cita };
  }

  // Solo se puede cancelar una cita propia
  cancelar(id: string): void {
    const esPropia = this.listar().some((c) => c.id === id);
    if (esPropia) this.citas.eliminar(id);
  }
}
