import { Especialidad } from "../entities/Especialidad";

export interface EspecialidadRepository {
  obtenerTodas(): Promise<Especialidad[]>;
}
