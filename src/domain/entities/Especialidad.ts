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
  icono: string; // nombre de un ícono de Ionicons (la pantalla lo interpreta)
  medicos: Medico[];
}
