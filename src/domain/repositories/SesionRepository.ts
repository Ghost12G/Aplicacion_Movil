import { Usuario } from "../entities/Usuario";

// Guarda quién tiene la sesión iniciada mientras la app está abierta
export interface SesionRepository {
  obtenerUsuario(): Usuario | null;
  establecerUsuario(usuario: Usuario | null): void;
}
