export type Sexo = "Hombre" | "Mujer";

export type AntecedenteFamiliar = "ninguno" | "lejano" | "directo";

export interface DatosRiesgo {
  edad: number;
  sexo: Sexo;
  pesoKg: number;
  tallaCm: number;
  cinturaCm: number;
  actividadFisica: boolean; // al menos 30 minutos al día
  frutasVerduras: boolean; // las come todos los días
  medicacionPresion: boolean;
  glucosaAlta: boolean;
  familiar: AntecedenteFamiliar; // familiares con diabetes
}

export type NivelRiesgo = "bajo" | "moderado" | "alto";

export interface ResultadoRiesgo {
  imc: number;
  puntaje: number; // de 0 a 26
  nivel: NivelRiesgo;
  titulo: string;
  frase: string;
  consejo: string;
}
