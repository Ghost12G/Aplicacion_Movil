import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ContactoPerfil, DatosRegistro, Usuario } from "../../domain/entities/Usuario";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { auth, db } from "../firebase/config";
import { traducirError } from "../firebase/errores";

type PerfilGuardado = Omit<Usuario, "uid">;

const claveCopia = (uid: string) => `perfil:${uid}`;

// Cuentas en Firebase Authentication y perfil en Firestore (colección "usuarios")
export class UsuarioFirebaseRepository implements UsuarioRepository {
  async registrar(datos: DatosRegistro): Promise<Usuario> {
    try {
      const credencial = await createUserWithEmailAndPassword(
        auth,
        datos.correo.trim(),
        datos.password
      );

      const perfil: PerfilGuardado = {
        nombre: datos.nombre,
        dni: datos.dni,
        correo: datos.correo.trim(),
        operador: "Claro",
        celular: datos.celular,
      };
      await setDoc(doc(db, "usuarios", credencial.user.uid), perfil);

      const usuario: Usuario = { uid: credencial.user.uid, ...perfil };
      await AsyncStorage.setItem(claveCopia(usuario.uid), JSON.stringify(usuario));
      return usuario;
    } catch (error) {
      throw new Error(traducirError(error));
    }
  }

  async iniciarSesion(correo: string, password: string): Promise<Usuario> {
    try {
      const credencial = await signInWithEmailAndPassword(auth, correo.trim(), password);
      return await this.cargarPerfil(credencial.user);
    } catch (error) {
      throw new Error(traducirError(error));
    }
  }

  async cerrarSesion(): Promise<void> {
    await signOut(auth);
  }

  async restaurarSesion(): Promise<Usuario | null> {
    const user = await this.esperarUsuarioInicial();
    return user ? this.cargarPerfil(user) : null;
  }

  async recuperarPassword(correo: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, correo.trim());
    } catch (error) {
      throw new Error(traducirError(error));
    }
  }

  async actualizarContacto(uid: string, datos: ContactoPerfil): Promise<Usuario> {
    try {
      await updateDoc(doc(db, "usuarios", uid), { ...datos });
      const user = auth.currentUser;
      if (!user) throw new Error("Tu sesión terminó. Inicia sesión otra vez.");
      return await this.cargarPerfil(user);
    } catch (error) {
      if (error instanceof Error && !("code" in error)) throw error;
      throw new Error(traducirError(error));
    }
  }

  // Firebase tarda un instante en recuperar la sesión guardada: se espera su primer aviso
  private esperarUsuarioInicial(): Promise<User | null> {
    return new Promise((resolver) => {
      const cancelar = onAuthStateChanged(auth, (user) => {
        cancelar();
        resolver(user);
      });
    });
  }

  // Lee el perfil de Firestore; si no hay internet, usa la última copia guardada
  private async cargarPerfil(user: User): Promise<Usuario> {
    try {
      const snap = await getDoc(doc(db, "usuarios", user.uid));
      if (snap.exists()) {
        const usuario = this.armar(user, snap.data() as Partial<PerfilGuardado>);
        await AsyncStorage.setItem(claveCopia(user.uid), JSON.stringify(usuario));
        return usuario;
      }
    } catch {
      // sin conexión: se usa la copia guardada
    }

    const copia = await AsyncStorage.getItem(claveCopia(user.uid));
    if (copia) {
      const usuario = this.armar(user, JSON.parse(copia) as Partial<PerfilGuardado>);
      await AsyncStorage.setItem(claveCopia(user.uid), JSON.stringify(usuario));
      return usuario;
    }
    return this.armar(user, {});
  }

  private armar(user: User, datos: Partial<PerfilGuardado>): Usuario {
    return {
      uid: user.uid,
      nombre: datos.nombre ?? user.email ?? "",
      dni: datos.dni ?? "",
      correo: user.email ?? datos.correo ?? "",
      operador: datos.operador ?? "Claro",
      celular: datos.celular ?? "",
    };
  }
}
