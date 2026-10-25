import { Atencion, Descanso, Receta } from "../types/usuario";
import { fechaRelativa } from "../utils/fechas";

// Datos de ejemplo (solo lectura)
export const atenciones: Atencion[] = [
  { id: "a1", tipo: "C.Externa", especialidad: "ODONTOLOGIA", especialista: "20871-CASTRO LEON PAOLA", actoMedico: "375914", fecha: fechaRelativa(-1, 18) },
  { id: "a2", tipo: "C.Externa", especialidad: "ODONTOLOGIA", especialista: "20871-CASTRO LEON PAOLA", actoMedico: "372951", fecha: fechaRelativa(-1, 3) },
  { id: "a3", tipo: "C.Externa", especialidad: "NUTRICION", especialista: "5778-RAMOS TORRES LUCIA", actoMedico: "372953", fecha: fechaRelativa(-2, 27) },
  { id: "a4", tipo: "C.Externa", especialidad: "MEDICINA GENERAL", especialista: "94054-SOTO PRADO MARIA ELENA", actoMedico: "372076", fecha: fechaRelativa(-2, 12) },
  { id: "a5", tipo: "Emergencia", especialidad: "EMERGENCIA", especialista: "31022-LUNA VERA RICARDO", actoMedico: "368120", fecha: fechaRelativa(-3, 8) },
  { id: "a6", tipo: "Hospitalización", especialidad: "MEDICINA INTERNA", especialista: "40517-PAREDES LUNA ANA", actoMedico: "361744", fecha: fechaRelativa(-4, 21) },
];

export const recetas: Receta[] = [
  {
    id: "r1",
    numero: "123944",
    fecha: fechaRelativa(-2, 21),
    especialidad: "ODONTOLOGIA",
    medico: "CASTRO LEON PAOLA",
    actoMedico: "370426",
    estado: "TOTAL",
    medicamentos: [
      {
        nombre: "IBUPROFENO 400 MG",
        cantidad: "10.00",
        unidad: "TB",
        indicacion: "TOMAR 1 TAB CADA 8 HORAS DESAYUNO ALMUERZO Y CENA x 3 días.",
      },
    ],
  },
  {
    id: "r2",
    numero: "125310",
    fecha: fechaRelativa(-1, 15),
    especialidad: "NUTRICION",
    medico: "RAMOS TORRES LUCIA",
    actoMedico: "372953",
    estado: "TOTAL",
    medicamentos: [
      {
        nombre: "COMPLEJO VITAMINICO",
        cantidad: "30.00",
        unidad: "TB",
        indicacion: "TOMAR 1 TAB AL DIA DESPUES DEL DESAYUNO x 30 días.",
      },
    ],
  },
  {
    id: "r3",
    numero: "127005",
    fecha: fechaRelativa(0, 10),
    especialidad: "MEDICINA GENERAL",
    medico: "SOTO PRADO MARIA ELENA",
    actoMedico: "374488",
    estado: "PARCIAL",
    medicamentos: [
      {
        nombre: "PARACETAMOL 500 MG",
        cantidad: "12.00",
        unidad: "TB",
        indicacion: "TOMAR 1 TAB CADA 8 HORAS SI HAY MOLESTIA x 4 días.",
      },
      {
        nombre: "LORATADINA 10 MG",
        cantidad: "5.00",
        unidad: "TB",
        indicacion: "TOMAR 1 TAB CADA 24 HORAS x 5 días.",
      },
    ],
  },
  {
    id: "r4",
    numero: "128450",
    fecha: fechaRelativa(1, 5),
    especialidad: "DERMATOLOGIA",
    medico: "SALAS RIOS DIEGO",
    actoMedico: "376002",
    estado: "PENDIENTE",
    medicamentos: [
      {
        nombre: "CREMA HIDRATANTE 100 G",
        cantidad: "1.00",
        unidad: "TUBO",
        indicacion: "APLICAR EN LA ZONA AFECTADA 2 VECES AL DIA x 15 días.",
      },
    ],
  },
];

export const descansos: Descanso[] = [
  { id: "d1", numero: "55102", desde: fechaRelativa(-1, 12), dias: 3, medico: "SOTO PRADO MARIA ELENA", especialidad: "MEDICINA GENERAL" },
  { id: "d2", numero: "54377", desde: fechaRelativa(-3, 3), dias: 2, medico: "LUNA VERA RICARDO", especialidad: "EMERGENCIA" },
];
