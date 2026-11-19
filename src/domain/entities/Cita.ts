import { Modalidad } from "./Especialidad";

export interface Cita {
  id: string;
  medicoId: string;
  pacienteDni: string; // dueño de la cita
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
