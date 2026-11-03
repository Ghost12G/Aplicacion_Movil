import { Usuario } from "../../domain/entities/Usuario";
import { SesionRepository } from "../../domain/repositories/SesionRepository";

// Guarda la sesión y la cuenta recordada EN MEMORIA.
export class SesionMemoriaRepository implements SesionRepository {
  private usuario: Usuario | null = null;
  private cuentaRecordada: Usuario | null = null;

  obtenerUsuario(): Usuario | null {
    return this.usuario;
  }

  establecerUsuario(usuario: Usuario | null): void {
    this.usuario = usuario;
  }

  obtenerCuentaRecordada(): Usuario | null {
    return this.cuentaRecordada;
  }

  guardarCuentaRecordada(usuario: Usuario | null): void {
    this.cuentaRecordada = usuario;
  }
}
