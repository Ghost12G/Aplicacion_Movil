import { Especialidad } from "../types/usuario";

export const CENTRO = "Huanchaco - Trujillo";

export const especialidades: Especialidad[] = [
  {
    id: "nutricion",
    nombre: "NUTRICION",
    servicio: "ATENCION NUTRICIONAL",
    icono: "nutrition",
    medicos: [
      { id: "n1", nombre: "RAMOS TORRES LUCIA", consultorio: "NUTRI1", modalidad: "Presencial", diasAdelante: 1, hora: "09:20" },
      { id: "n2", nombre: "VEGA SOLIS MARTIN", consultorio: "NUTRI2", modalidad: "Virtual", diasAdelante: 3, hora: "14:00" },
    ],
  },
  {
    id: "psicologia",
    nombre: "PSICOLOGIA",
    servicio: "ATENCION PSICOLOGICA",
    icono: "happy",
    medicos: [
      { id: "p1", nombre: "ALVARADO PEREZ ALCIDES", consultorio: "PSICO", modalidad: "Presencial", diasAdelante: 1, hora: "13:20" },
      { id: "p2", nombre: "MEJIA FERREL INDIRA", consultorio: "PSIC2", modalidad: "Virtual", diasAdelante: 2, hora: "08:20" },
    ],
  },
  {
    id: "dentista",
    nombre: "DENTISTA",
    servicio: "ATENCION ODONTOLOGICA",
    icono: "medical",
    medicos: [
      { id: "d1", nombre: "CASTRO LEON PAOLA", consultorio: "ODONT1", modalidad: "Presencial", diasAdelante: 2, hora: "15:00" },
    ],
  },
  {
    id: "dermatologia",
    nombre: "DERMATOLOGIA",
    servicio: "ATENCION DERMATOLOGICA",
    icono: "body",
    medicos: [
      { id: "de1", nombre: "SALAS RIOS DIEGO", consultorio: "DERMA1", modalidad: "Presencial", diasAdelante: 4, hora: "09:00" },
      { id: "de2", nombre: "PAREDES LUNA ANA", consultorio: "DERMA2", modalidad: "Virtual", diasAdelante: 1, hora: "16:00" },
    ],
  },
];
