import { DatosRegistro, Usuario } from "../../domain/entities/Usuario";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { SesionRepository } from "../../domain/repositories/SesionRepository";

export class AuthService {
  private usuarios: UsuarioRepository;
  private sesion: SesionRepository;

  constructor(usuarios: UsuarioRepository, sesion: SesionRepository) {
    this.usuarios = usuarios;
    this.sesion = sesion;
  }

  async registrar(datos: DatosRegistro): Promise<Usuario> {
    const usuario = await this.usuarios.registrar(datos);
    this.sesion.establecerUsuario(usuario);
    return usuario;
  }

  async iniciarSesion(correo: string, password: string): Promise<Usuario> {
    const usuario = await this.usuarios.iniciarSesion(correo, password);
    this.sesion.establecerUsuario(usuario);
    return usuario;
  }

  async restaurarSesion(): Promise<Usuario | null> {
    const usuario = await this.usuarios.restaurarSesion();
    this.sesion.establecerUsuario(usuario);
    return usuario;
  }

  async cerrarSesion(): Promise<void> {
    await this.usuarios.cerrarSesion();
    this.sesion.establecerUsuario(null);
  }

  recuperarPassword(correo: string): Promise<void> {
    return this.usuarios.recuperarPassword(correo);
  }

  obtenerUsuarioActual(): Usuario | null {
    return this.sesion.obtenerUsuario();
  }
}
