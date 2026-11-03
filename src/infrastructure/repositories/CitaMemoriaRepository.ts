import { Cita } from "../../domain/entities/Cita";
import { CitaRepository } from "../../domain/repositories/CitaRepository";

export class CitaMemoriaRepository implements CitaRepository {
  private citas: Cita[] = [];

  agregar(cita: Cita): void {
    this.citas.push(cita);
  }

  listar(): Cita[] {
    return [...this.citas];
  }

  eliminar(id: string): void {
    this.citas = this.citas.filter((c) => c.id !== id);
  }
}
