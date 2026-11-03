import { Cita } from "../entities/Cita";

export interface CitaRepository {
  agregar(cita: Cita): void;
  listar(): Cita[];
  eliminar(id: string): void;
}
