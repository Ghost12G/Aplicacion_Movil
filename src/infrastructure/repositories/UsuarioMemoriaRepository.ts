import { ContactoPerfil, DatosRegistro, Usuario } from "../../domain/entities/Usuario";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";

type UsuarioGuardado = Usuario & { password: string };

export class UsuarioMemoriaRepository implements UsuarioRepository {
  private usuarios: UsuarioGuardado[] = [
    {
      uid: "demo-12345678",
      dni: "12345678",
      password: "1234",
      nombre: "Jose Palacios",
      operador: "Claro",
      celular: "999888777",
      correo: "jose.palacios@correo.com",
    },
  ];

  async registrar(datos: DatosRegistro): Promise<Usuario> {
    const correo = datos.correo.trim();
    const existe = this.usuarios.some(
      (usuario) => usuario.dni === datos.dni || usuario.correo.toLowerCase() === correo.toLowerCase()
    );
    if (existe) throw new Error("Ya existe una cuenta con ese correo o documento.");

    const usuario: UsuarioGuardado = {
      uid: Date.now().toString(),
      dni: datos.dni,
      password: datos.password,
      nombre: datos.nombre,
      correo,
      operador: "Claro",
      celular: datos.celular,
    };
    this.usuarios.push(usuario);
    return this.sinPassword(usuario);
  }

  async iniciarSesion(correo: string, password: string): Promise<Usuario> {
    const encontrado = this.usuarios.find(
      (usuario) =>
        usuario.correo.toLowerCase() === correo.trim().toLowerCase() &&
        usuario.password === password
    );
    if (!encontrado) throw new Error("Correo o contraseña incorrectos.");
    return this.sinPassword(encontrado);
  }

  cerrarSesion(): Promise<void> {
    return Promise.resolve();
  }

  async restaurarSesion(): Promise<Usuario | null> {
    return null;
  }

  async recuperarPassword(): Promise<void> {
    throw new Error("La recuperación de contraseña requiere Firebase.");
  }

  async actualizarContacto(uid: string, datos: ContactoPerfil): Promise<Usuario> {
    const posicion = this.usuarios.findIndex((usuario) => usuario.uid === uid);
    if (posicion === -1) throw new Error("No se encontró el usuario.");

    this.usuarios[posicion] = { ...this.usuarios[posicion], ...datos };
    return this.sinPassword(this.usuarios[posicion]);
  }

  private sinPassword({ password: _password, ...usuario }: UsuarioGuardado): Usuario {
    return usuario;
  }
}
