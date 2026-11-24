import { Modalidad } from "./Especialidad";

export interface Cita {
  id: string;
  pacienteUid?: string;
  medicoId: string;
  pacienteDni: string; // dueño de la cita
  especialidadId?: string;
  especialidad: string;
  servicio: string;
  medico: string;
  consultorio: string;
  modalidad: Modalidad;
  fecha: string;
  hora: string;
  estado: string;
  paciente: string;
  centro: string;
}

export function mismaEspecialidad(
  primera: Pick<Cita, "especialidadId" | "especialidad">,
  segunda: Pick<Cita, "especialidadId" | "especialidad">
): boolean {
  if (primera.especialidadId && segunda.especialidadId) {
    return primera.especialidadId === segunda.especialidadId;
  }
  return primera.especialidad.trim().toUpperCase() === segunda.especialidad.trim().toUpperCase();
}
