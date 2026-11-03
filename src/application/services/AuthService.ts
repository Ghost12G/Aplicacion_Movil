import { Usuario } from "../../domain/entities/Usuario";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { SesionRepository } from "../../domain/repositories/SesionRepository";

// Registro, inicio de sesión y cuenta recordada
export class AuthService {
  private usuarios: UsuarioRepository;
  private sesion: SesionRepository;

  constructor(usuarios: UsuarioRepository, sesion: SesionRepository) {
    this.usuarios = usuarios;
    this.sesion = sesion;
  }

  // Devuelve false si el documento ya está registrado
  registrar(usuario: Usuario): boolean {
    return this.usuarios.registrar(usuario);
  }

  iniciarSesion(dni: string, password: string, recordar: boolean): Usuario | null {
    const usuario = this.usuarios.buscarPorCredenciales(dni, password);
    this.sesion.establecerUsuario(usuario);

    if (usuario) {
      this.sesion.guardarCuentaRecordada(recordar ? usuario : null);
    }
    return usuario;
  }

  iniciarSesionRecordada(): Usuario | null {
    const cuenta = this.sesion.obtenerCuentaRecordada();
    this.sesion.establecerUsuario(cuenta);
    return cuenta;
  }

  cerrarSesion(): void {
    this.sesion.establecerUsuario(null);
  }

  obtenerUsuarioActual(): Usuario | null {
    return this.sesion.obtenerUsuario();
  }

  obtenerCuentaRecordada(): Usuario | null {
    return this.sesion.obtenerCuentaRecordada();
  }

  olvidarCuenta(): void {
    this.sesion.guardarCuentaRecordada(null);
  }
}
