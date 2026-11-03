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
