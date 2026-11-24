import { Especialidad } from "../../domain/entities/Especialidad";
import { EspecialidadRepository } from "../../domain/repositories/EspecialidadRepository";
import { especialidades } from "../data/especialidades";

// Entrega las especialidades de ejemplo (datos fijos)
export class EspecialidadEstaticaRepository implements EspecialidadRepository {
  async obtenerTodas(): Promise<Especialidad[]> {
    return especialidades;
  }
}
