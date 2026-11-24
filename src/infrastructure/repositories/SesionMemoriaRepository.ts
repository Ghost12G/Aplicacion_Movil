import { Usuario } from "../../domain/entities/Usuario";
import { SesionRepository } from "../../domain/repositories/SesionRepository";

// Guarda la sesión EN MEMORIA mientras la app está abierta.
export class SesionMemoriaRepository implements SesionRepository {
  private usuario: Usuario | null = null;

  obtenerUsuario(): Usuario | null {
    return this.usuario;
  }

  establecerUsuario(usuario: Usuario | null): void {
    this.usuario = usuario;
  }
}
