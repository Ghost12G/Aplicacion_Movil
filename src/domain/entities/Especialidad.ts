export type Modalidad = "Presencial" | "Virtual";

export interface Medico {
  id: string;
  nombre: string;
  consultorio: string;
  modalidad: Modalidad;
  diasAdelante: number; 
  hora: string;
}

export interface Especialidad {
  id: string;
  nombre: string;
  servicio: string;
  icono: string; 
  medicos: Medico[];
}
