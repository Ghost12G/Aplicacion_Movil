import { Usuario } from "../entities/Usuario";

export interface SesionRepository {
  obtenerUsuario(): Usuario | null;
  establecerUsuario(usuario: Usuario | null): void;
  obtenerCuentaRecordada(): Usuario | null;
  guardarCuentaRecordada(usuario: Usuario | null): void;
}
