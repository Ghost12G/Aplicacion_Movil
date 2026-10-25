import { Ionicons } from "@expo/vector-icons";

export interface Usuario {
  dni: string;
  password: string;
  nombre: string;
  operador: string;
  celular: string;
  telefonoFijo: string;
  correo: string;
}

// Datos que se pueden editar en "Mi Perfil"
export type ContactoPerfil = Pick<
  Usuario,
  "operador" | "celular" | "telefonoFijo" | "correo"
>;

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

export type TipoAtencion = "C.Externa" | "Emergencia" | "Hospitalización" | "Cirugía";

export interface Atencion {
  id: string;
  tipo: TipoAtencion;
  especialidad: string;
  especialista: string;
  actoMedico: string;
  fecha: Date;
}

export interface Medicamento {
  nombre: string;
  cantidad: string;
  unidad: string;
  indicacion: string;
}

export interface Receta {
  id: string;
  numero: string;
  fecha: Date;
  especialidad: string;
  medico: string;
  actoMedico: string;
  estado: string;
  medicamentos: Medicamento[];
}

export interface Descanso {
  id: string;
  numero: string;
  desde: Date;
  dias: number;
  medico: string;
  especialidad: string;
}
