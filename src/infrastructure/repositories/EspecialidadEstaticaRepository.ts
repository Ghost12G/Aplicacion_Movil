import { Especialidad } from "../../domain/entities/Especialidad";
import { EspecialidadRepository } from "../../domain/repositories/EspecialidadRepository";
import { especialidades } from "../data/especialidades";

export class EspecialidadEstaticaRepository implements EspecialidadRepository {
  async obtenerTodas(): Promise<Especialidad[]> {
    return especialidades;
  }
}
