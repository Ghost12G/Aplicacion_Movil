import { ContactoPerfil, Usuario } from "../../domain/entities/Usuario";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";

// Guarda los usuarios EN MEMORIA: se pierden al cerrar la aplicación.
export class UsuarioMemoriaRepository implements UsuarioRepository {
  private usuarios: Usuario[] = [
    {
      dni: "12345678",
      password: "1234",
      nombre: "Jose Palacios",
      operador: "Claro",
      celular: "999888777",
      telefonoFijo: "044222333",
      correo: "jose.palacios@correo.com",
    },
  ];

  registrar(usuario: Usuario): boolean {
    const existe = this.usuarios.some((u) => u.dni === usuario.dni);
    if (existe) return false;

    this.usuarios.push(usuario);
    return true;
  }

  buscarPorCredenciales(dni: string, password: string): Usuario | null {
    const encontrado = this.usuarios.find(
      (u) => u.dni === dni && u.password === password
    );
    return encontrado ?? null;
  }

  actualizarContacto(dni: string, datos: ContactoPerfil): Usuario | null {
    const posicion = this.usuarios.findIndex((u) => u.dni === dni);
    if (posicion === -1) return null;

    this.usuarios[posicion] = { ...this.usuarios[posicion], ...datos };
    return this.usuarios[posicion];
  }
}
