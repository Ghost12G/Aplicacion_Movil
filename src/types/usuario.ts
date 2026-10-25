import { Ionicons } from "@expo/vector-icons";

export interface Usuario {
  dni: string;
  password: string;
  nombre: string;
}

export type TipoDocumento = "D.N.I." | "C.E.";

export type TipoSolicitud = "Consulta" | "Reclamo" | "Sugerencia";

export interface Solicitud {
  nombre: string;
  telefono: string;
  tipo: TipoSolicitud | "";
  descripcion: string;
}

export type Modalidad = "Presencial" | "Virtual";

export interface Medico {
  id: string;
  nombre: string;
  consultorio: string;
  modalidad: Modalidad;
  diasAdelante: number; // en cuántos días está su cita sugerida
  hora: string;
}

export interface Especialidad {
  id: string;
  nombre: string;
  servicio: string;
  icono: keyof typeof Ionicons.glyphMap;
  medicos: Medico[];
}

export interface Cita {
  id: string;
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
