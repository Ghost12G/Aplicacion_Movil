import { Cita, Usuario } from "../types/usuario";

// Datos EN MEMORIA: se guardan mientras la app está abierta
// y se pierden cuando se cierra.
const usuarios: Usuario[] = [
  { dni: "12345678", password: "1234", nombre: "Jose Palacios" },
];
let usuarioActual: Usuario | null = null;
let citas: Cita[] = [];

// ---------- Usuarios ----------
export function registrarUsuario(nuevo: Usuario): boolean {
  const existe = usuarios.some((u) => u.dni === nuevo.dni);
  if (existe) return false;
  usuarios.push(nuevo);
  return true;
}

export function iniciarSesion(dni: string, password: string): Usuario | null {
  const encontrado = usuarios.find(
    (u) => u.dni === dni && u.password === password
  );
  usuarioActual = encontrado ?? null;
  return usuarioActual;
}

export function salir() {
  usuarioActual = null;
}

export function obtenerUsuarioActual(): Usuario | null {
  return usuarioActual;
}

// ---------- Citas (crear, leer, eliminar) ----------
export function agregarCita(cita: Cita) {
  citas.push(cita);
}

export function obtenerCitas(): Cita[] {
  return [...citas];
}

export function cancelarCita(id: string) {
  citas = citas.filter((c) => c.id !== id);
}
