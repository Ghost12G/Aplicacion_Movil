import * as Network from "expo-network";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
} from "firebase/firestore";
import { Cita } from "../../domain/entities/Cita";
import { Especialidad } from "../../domain/entities/Especialidad";
import {
  CitaPendienteSincronizacion,
  CitaRepository,
} from "../../domain/repositories/CitaRepository";
import { EspecialidadRepository } from "../../domain/repositories/EspecialidadRepository";
import { SesionRepository } from "../../domain/repositories/SesionRepository";
import { auth, db } from "../firebase/config";

export interface ResultadoSincronizacionCitas {
  estado: "sin-sesion" | "sin-conexion" | "pendiente" | "completa";
  sincronizadas: number;
  pendientes: number;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function esCitaRemota(valor: unknown): valor is Cita {
  return (
    esObjeto(valor) &&
    typeof valor.id === "string" &&
    typeof valor.pacienteUid === "string" &&
    typeof valor.medicoId === "string" &&
    typeof valor.pacienteDni === "string" &&
    (valor.especialidadId === undefined || typeof valor.especialidadId === "string") &&
    typeof valor.especialidad === "string" &&
    typeof valor.servicio === "string" &&
    typeof valor.medico === "string" &&
    typeof valor.consultorio === "string" &&
    (valor.modalidad === "Presencial" || valor.modalidad === "Virtual") &&
    typeof valor.fecha === "string" &&
    typeof valor.hora === "string" &&
    typeof valor.estado === "string" &&
    typeof valor.paciente === "string" &&
    typeof valor.centro === "string"
  );
}

function mismoNombre(primero: string, segundo: string): boolean {
  return primero.trim().toUpperCase() === segundo.trim().toUpperCase();
}

export class CitaFirestoreSyncService {
  private readonly citas: CitaRepository;
  private readonly sesion: SesionRepository;
  private readonly especialidades: EspecialidadRepository;
  private sincronizaciones = new Map<string, Promise<ResultadoSincronizacionCitas>>();

  constructor(
    citas: CitaRepository,
    sesion: SesionRepository,
    especialidades: EspecialidadRepository
  ) {
    this.citas = citas;
    this.sesion = sesion;
    this.especialidades = especialidades;
  }

  async sincronizarPendientes(): Promise<ResultadoSincronizacionCitas> {
    const usuario = this.sesion.obtenerUsuario();
    if (!usuario) {
      return { estado: "sin-sesion", sincronizadas: 0, pendientes: 0 };
    }

    const sincronizacionActiva = this.sincronizaciones.get(usuario.uid);
    if (sincronizacionActiva) return sincronizacionActiva;

    const sincronizacion = this.sincronizarUsuario(usuario.uid, usuario.dni);
    this.sincronizaciones.set(usuario.uid, sincronizacion);
    try {
      return await sincronizacion;
    } finally {
      if (this.sincronizaciones.get(usuario.uid) === sincronizacion) {
        this.sincronizaciones.delete(usuario.uid);
      }
    }
  }

  async confirmarReserva(cita: Cita): Promise<void> {
    const usuario = this.sesion.obtenerUsuario();
    if (!usuario) throw new Error("Debes iniciar sesión para reservar una cita.");
    if (cita.pacienteUid !== usuario.uid || !cita.especialidadId) {
      throw new Error("No se pudo confirmar la cita porque sus datos no son válidos.");
    }

    const estadoRed = await Network.getNetworkStateAsync();
    if (!estadoRed.isConnected || estadoRed.isInternetReachable === false) {
      throw new Error("Conéctate a internet para confirmar una reserva nueva.");
    }

    const confirmada = await this.guardarCitaConBloqueo(cita, usuario.uid, true);
    if (!confirmada) {
      throw new Error(
        "Ya tienes una cita activa en esta especialidad o la reserva cambió desde otro teléfono. Actualiza tus citas e inténtalo de nuevo."
      );
    }
  }

  private async sincronizarUsuario(
    usuarioUid: string,
    pacienteDni: string
  ): Promise<ResultadoSincronizacionCitas> {
    const estadoRed = await Network.getNetworkStateAsync();
    if (!estadoRed.isConnected || estadoRed.isInternetReachable === false) {
      const pendientes = await this.citas.listarPendientesSincronizacion(usuarioUid);
      return {
        estado: "sin-conexion",
        sincronizadas: 0,
        pendientes: pendientes.length,
      };
    }

    let catalogo: Especialidad[] | null = null;
    const obtenerCatalogo = async (): Promise<Especialidad[]> => {
      if (!catalogo) catalogo = await this.especialidades.obtenerTodas();
      return catalogo;
    };

    let sincronizadas = 0;
    const pendientesIniciales =
      await this.citas.listarPendientesSincronizacion(usuarioUid);
    for (const pendiente of pendientesIniciales) {
      if (pendiente.accion !== "eliminar") continue;
      if (auth.currentUser?.uid !== usuarioUid) {
        throw new Error(
          "La sesión cambió. Inicia sesión con la cuenta propietaria para sincronizar."
        );
      }
      await this.eliminarCitaRemota(usuarioUid, pendiente);
      await this.citas.confirmarPendienteSincronizacion(pendiente.id);
      sincronizadas += 1;
    }

    const citasRemotasIds = await this.descargarCitas(
      usuarioUid,
      obtenerCatalogo
    );
    await this.citas.prepararSincronizacion(
      usuarioUid,
      pacienteDni,
      citasRemotasIds
    );
    let pendientes = await this.citas.listarPendientesSincronizacion(usuarioUid);

    while (pendientes.length > 0) {
      const sincronizadasAntesDelLote = sincronizadas;
      let hayPendienteSinResolver = false;
      for (const pendiente of pendientes) {
        if (auth.currentUser?.uid !== usuarioUid) {
          throw new Error(
            "La sesión cambió. Inicia sesión con la cuenta propietaria para sincronizar."
          );
        }

        if (pendiente.accion === "guardar") {
          if (!pendiente.cita) {
            throw new Error(`La cita pendiente ${pendiente.citaId} no contiene datos.`);
          }
          const cita = await this.resolverCita(
            { ...pendiente.cita, pacienteUid: usuarioUid },
            obtenerCatalogo
          );
          const guardada = await this.guardarCitaConBloqueo(
            cita,
            usuarioUid,
            false
          );
          if (!guardada) {
            hayPendienteSinResolver = true;
            continue;
          }
        } else {
          await this.eliminarCitaRemota(usuarioUid, pendiente);
        }

        await this.citas.confirmarPendienteSincronizacion(pendiente.id);
        sincronizadas += 1;
      }

      pendientes = await this.citas.listarPendientesSincronizacion(usuarioUid);
      if (hayPendienteSinResolver && pendientes.length > 0) {
        if (sincronizadas > sincronizadasAntesDelLote) continue;
        return {
          estado: "pendiente",
          sincronizadas,
          pendientes: pendientes.length,
        };
      }
    }

    await this.descargarCitas(usuarioUid, obtenerCatalogo);
    return {
      estado: "completa",
      sincronizadas,
      pendientes: 0,
    };
  }

  private async descargarCitas(
    usuarioUid: string,
    obtenerCatalogo: () => Promise<Especialidad[]>
  ): Promise<string[]> {
    const referencia = collection(db, "usuarios", usuarioUid, "citas");
    const snapshot = await getDocs(referencia);
    const citasRemotas = snapshot.docs.map((documento) => {
      const datos: unknown = documento.data();
      if (
        !esCitaRemota(datos) ||
        datos.id !== documento.id ||
        datos.pacienteUid !== usuarioUid
      ) {
        throw new Error(
          `La cita ${documento.id} guardada en Firestore tiene datos no válidos.`
        );
      }
      return datos;
    });

    await this.citas.sincronizarDesdeFirestore(usuarioUid, citasRemotas);

    const citasConEspecialidad: Cita[] = [];
    for (const citaRemota of citasRemotas) {
      const cita = await this.resolverCita(citaRemota, obtenerCatalogo);
      if (await this.asegurarBloqueo(cita, usuarioUid)) {
        citasConEspecialidad.push(cita);
      }
    }
    await this.citas.sincronizarDesdeFirestore(usuarioUid, citasConEspecialidad);
    return citasConEspecialidad.map((cita) => cita.id);
  }

  private async resolverCita(
    cita: Cita,
    obtenerCatalogo: () => Promise<Especialidad[]>
  ): Promise<Cita> {
    if (cita.especialidadId) return cita;

    const catalogo = await obtenerCatalogo();
    const especialidad = catalogo.find((item) =>
      mismoNombre(item.nombre, cita.especialidad)
    );
    if (!especialidad) {
      throw new Error(
        `No se pudo identificar la especialidad "${cita.especialidad}" de una cita guardada.`
      );
    }

    return { ...cita, especialidadId: especialidad.id };
  }

  private async asegurarBloqueo(cita: Cita, usuarioUid: string): Promise<boolean> {
    if (!cita.especialidadId) {
      throw new Error(`La cita ${cita.id} no tiene identificador de especialidad.`);
    }

    const citaRef = doc(db, "usuarios", usuarioUid, "citas", cita.id);
    const bloqueoRef = doc(
      db,
      "usuarios",
      usuarioUid,
      "bloqueos_especialidad",
      cita.especialidadId
    );
    let bloqueoObsoleto = false;
    let citaExiste = true;

    await runTransaction(db, async (transaccion) => {
      bloqueoObsoleto = false;
      citaExiste = true;
      const bloqueo = await transaccion.get(bloqueoRef);
      const documentoCita = await transaccion.get(citaRef);
      if (!documentoCita.exists()) {
        citaExiste = false;
        return;
      }

      const datosCita = documentoCita.data();
      if (datosCita.pacienteUid !== usuarioUid || datosCita.id !== cita.id) {
        throw new Error(`La cita ${cita.id} no pertenece a la cuenta actual.`);
      }

      if (bloqueo.exists()) {
        if (bloqueo.data().citaId !== cita.id) {
          const citaBloqueadaId = bloqueo.data().citaId;
          if (typeof citaBloqueadaId !== "string") {
            throw new Error(
              `El bloqueo de ${cita.especialidad} tiene datos no válidos.`
            );
          }
          const citaBloqueadaRef = doc(
            db,
            "usuarios",
            usuarioUid,
            "citas",
            citaBloqueadaId
          );
          const citaBloqueada = await transaccion.get(citaBloqueadaRef);
          if (!citaBloqueada.exists()) {
            transaccion.delete(bloqueoRef);
            bloqueoObsoleto = true;
          }
          return;
        }
      } else {
        transaccion.set(bloqueoRef, {
          citaId: cita.id,
          especialidadId: cita.especialidadId,
          pacienteUid: usuarioUid,
        });
      }

      if (datosCita.especialidadId !== cita.especialidadId) {
        transaccion.update(citaRef, { especialidadId: cita.especialidadId });
      }
    });

    if (bloqueoObsoleto) return this.asegurarBloqueo(cita, usuarioUid);
    return citaExiste;
  }

  private async guardarCitaConBloqueo(
    cita: Cita,
    usuarioUid: string,
    crearBloqueoSiFalta: boolean
  ): Promise<boolean> {
    if (!cita.especialidadId) return false;

    const citaRef = doc(db, "usuarios", usuarioUid, "citas", cita.id);
    const bloqueoRef = doc(
      db,
      "usuarios",
      usuarioUid,
      "bloqueos_especialidad",
      cita.especialidadId
    );

    return runTransaction(db, async (transaccion) => {
      const bloqueo = await transaccion.get(bloqueoRef);
      const documentoCita = await transaccion.get(citaRef);

      if (bloqueo.exists()) {
        if (
          bloqueo.data().citaId !== cita.id ||
          !documentoCita.exists() ||
          documentoCita.data().pacienteUid !== usuarioUid
        ) {
          return false;
        }
        transaccion.set(citaRef, { ...cita, pacienteUid: usuarioUid });
        return true;
      }

      if (!crearBloqueoSiFalta) return false;
      if (
        documentoCita.exists() &&
        documentoCita.data().pacienteUid !== usuarioUid
      ) {
        return false;
      }

      transaccion.set(bloqueoRef, {
        citaId: cita.id,
        especialidadId: cita.especialidadId,
        pacienteUid: usuarioUid,
      });
      transaccion.set(citaRef, { ...cita, pacienteUid: usuarioUid });
      return true;
    });
  }

  private async eliminarCitaRemota(
    usuarioUid: string,
    pendiente: CitaPendienteSincronizacion
  ): Promise<void> {
    const citaRef = doc(
      db,
      "usuarios",
      usuarioUid,
      "citas",
      pendiente.citaId
    );
    let especialidadId = pendiente.cita?.especialidadId;

    if (!especialidadId) {
      const documentoCita = await getDoc(citaRef);
      const datosCita: unknown = documentoCita.exists()
        ? documentoCita.data()
        : undefined;
      if (esObjeto(datosCita) && typeof datosCita.especialidadId === "string") {
        especialidadId = datosCita.especialidadId;
      }
    }

    const bloqueosRef = collection(
      db,
      "usuarios",
      usuarioUid,
      "bloqueos_especialidad"
    );
    if (!especialidadId) {
      const bloqueos = await getDocs(bloqueosRef);
      especialidadId = bloqueos.docs.find(
        (bloqueo) => bloqueo.data().citaId === pendiente.citaId
      )?.id;
    }

    await runTransaction(db, async (transaccion) => {
      const documentoCita = await transaccion.get(citaRef);
      const bloqueoRef = especialidadId
        ? doc(bloqueosRef, especialidadId)
        : null;
      const bloqueo = bloqueoRef ? await transaccion.get(bloqueoRef) : null;

      if (
        bloqueoRef &&
        bloqueo &&
        bloqueo.exists() &&
        bloqueo.data().citaId === pendiente.citaId
      ) {
        transaccion.delete(bloqueoRef);
      }
      if (documentoCita.exists()) transaccion.delete(citaRef);
    });
  }
}
