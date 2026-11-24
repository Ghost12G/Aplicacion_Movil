import * as SQLite from "expo-sqlite";
import { Cita } from "../../domain/entities/Cita";
import {
  CitaPendienteSincronizacion,
  CitaRepository,
  ResultadoAgregarCita,
  ResultadoReprogramarCita,
} from "../../domain/repositories/CitaRepository";

interface CitaRow {
  id: string;
  usuario_uid: string;
  medico_id: string;
  paciente_dni: string;
  especialidad_id: string;
  especialidad: string;
  servicio: string;
  medico: string;
  consultorio: string;
  modalidad: Cita["modalidad"];
  fecha: string;
  hora: string;
  estado: string;
  paciente: string;
  centro: string;
}

interface CitaPendienteRow {
  id: number;
  cita_id: string;
  usuario_uid: string;
  accion: "guardar" | "eliminar";
  cita_json: string | null;
}

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function abrirBaseDeDatos(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync("clinic-digital.db");
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS citas (
      id TEXT PRIMARY KEY NOT NULL,
      usuario_uid TEXT NOT NULL DEFAULT '',
      medico_id TEXT NOT NULL,
      paciente_dni TEXT NOT NULL,
      especialidad_id TEXT NOT NULL DEFAULT '',
      especialidad TEXT NOT NULL,
      servicio TEXT NOT NULL,
      medico TEXT NOT NULL,
      consultorio TEXT NOT NULL,
      modalidad TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      estado TEXT NOT NULL,
      paciente TEXT NOT NULL,
      centro TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_citas_medico_fecha_hora
      ON citas (medico_id, fecha, hora);
    CREATE INDEX IF NOT EXISTS idx_citas_paciente
      ON citas (paciente_dni);
    CREATE TABLE IF NOT EXISTS citas_pendientes_sync (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cita_id TEXT NOT NULL,
      usuario_uid TEXT NOT NULL,
      accion TEXT NOT NULL CHECK (accion IN ('guardar', 'eliminar')),
      cita_json TEXT,
      UNIQUE (usuario_uid, cita_id)
    );
  `);

  const columnasCitas = await database.getAllAsync<{ name: string }>(
    "PRAGMA table_info(citas)"
  );
  if (!columnasCitas.some((columna) => columna.name === "usuario_uid")) {
    await database.execAsync(
      "ALTER TABLE citas ADD COLUMN usuario_uid TEXT NOT NULL DEFAULT ''"
    );
  }
  if (!columnasCitas.some((columna) => columna.name === "especialidad_id")) {
    await database.execAsync(
      "ALTER TABLE citas ADD COLUMN especialidad_id TEXT NOT NULL DEFAULT ''"
    );
  }
  await database.execAsync(
    "CREATE INDEX IF NOT EXISTS idx_citas_paciente_especialidad ON citas (paciente_dni, especialidad_id)"
  );
  await database.execAsync(
    "CREATE INDEX IF NOT EXISTS idx_citas_usuario_uid ON citas (usuario_uid)"
  );
  return database;
}

function obtenerBaseDeDatos(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = abrirBaseDeDatos().catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

function convertirCita(fila: CitaRow): Cita {
  return {
    id: fila.id,
    pacienteUid: fila.usuario_uid || undefined,
    medicoId: fila.medico_id,
    pacienteDni: fila.paciente_dni,
    especialidadId: fila.especialidad_id || undefined,
    especialidad: fila.especialidad,
    servicio: fila.servicio,
    medico: fila.medico,
    consultorio: fila.consultorio,
    modalidad: fila.modalidad,
    fecha: fila.fecha,
    hora: fila.hora,
    estado: fila.estado,
    paciente: fila.paciente,
    centro: fila.centro,
  };
}

async function insertarCita(
  database: Pick<SQLite.SQLiteDatabase, "runAsync">,
  cita: Cita
): Promise<void> {
  await database.runAsync(
    `INSERT INTO citas (
      id, usuario_uid, medico_id, paciente_dni, especialidad_id, especialidad,
      servicio, medico, consultorio, modalidad, fecha, hora, estado, paciente, centro
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      cita.id,
      cita.pacienteUid ?? "",
      cita.medicoId,
      cita.pacienteDni,
      cita.especialidadId ?? "",
      cita.especialidad,
      cita.servicio,
      cita.medico,
      cita.consultorio,
      cita.modalidad,
      cita.fecha,
      cita.hora,
      cita.estado,
      cita.paciente,
      cita.centro,
    ]
  );
}

async function reemplazarCitaSincronizada(
  database: Pick<SQLite.SQLiteDatabase, "runAsync">,
  cita: Cita
): Promise<void> {
  await database.runAsync(
    `INSERT INTO citas (
      id, usuario_uid, medico_id, paciente_dni, especialidad_id, especialidad,
      servicio, medico, consultorio, modalidad, fecha, hora, estado, paciente, centro
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      usuario_uid = excluded.usuario_uid,
      medico_id = excluded.medico_id,
      paciente_dni = excluded.paciente_dni,
      especialidad_id = excluded.especialidad_id,
      especialidad = excluded.especialidad,
      servicio = excluded.servicio,
      medico = excluded.medico,
      consultorio = excluded.consultorio,
      modalidad = excluded.modalidad,
      fecha = excluded.fecha,
      hora = excluded.hora,
      estado = excluded.estado,
      paciente = excluded.paciente,
      centro = excluded.centro
    WHERE citas.usuario_uid = excluded.usuario_uid
       OR (citas.usuario_uid = '' AND citas.paciente_dni = excluded.paciente_dni)`,
    [
      cita.id,
      cita.pacienteUid ?? "",
      cita.medicoId,
      cita.pacienteDni,
      cita.especialidadId ?? "",
      cita.especialidad,
      cita.servicio,
      cita.medico,
      cita.consultorio,
      cita.modalidad,
      cita.fecha,
      cita.hora,
      cita.estado,
      cita.paciente,
      cita.centro,
    ]
  );
}

async function encolarSincronizacion(
  database: Pick<SQLite.SQLiteDatabase, "runAsync">,
  citaId: string,
  usuarioUid: string,
  accion: "guardar" | "eliminar",
  cita: Cita | null
): Promise<void> {
  await database.runAsync(
    "DELETE FROM citas_pendientes_sync WHERE usuario_uid = ? AND cita_id = ?",
    [usuarioUid, citaId]
  );
  await database.runAsync(
    `INSERT INTO citas_pendientes_sync (cita_id, usuario_uid, accion, cita_json)
     VALUES (?, ?, ?, ?)`,
    [citaId, usuarioUid, accion, cita ? JSON.stringify(cita) : null]
  );
}

export class CitaSQLiteRepository implements CitaRepository {
  async agregarSiDisponible(
    cita: Cita,
    cuposMaximos: number
  ): Promise<ResultadoAgregarCita> {
    const database = await obtenerBaseDeDatos();
    let resultado: ResultadoAgregarCita = { ok: true };

    await database.withExclusiveTransactionAsync(async (transaction) => {
      const citaEnEspecialidad = await transaction.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) AS total FROM citas
         WHERE paciente_dni = ? AND (
           (especialidad_id <> '' AND especialidad_id = ?)
           OR (especialidad_id = '' AND UPPER(TRIM(especialidad)) = UPPER(TRIM(?)))
         )`,
        [cita.pacienteDni, cita.especialidadId ?? "", cita.especialidad]
      );
      if ((citaEnEspecialidad?.total ?? 0) > 0) {
        resultado = { ok: false, motivo: "especialidad-ya-tiene-cita" };
        return;
      }

      const citaDuplicada = await transaction.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) AS total FROM citas
         WHERE paciente_dni = ? AND fecha = ? AND hora = ?`,
        [cita.pacienteDni, cita.fecha, cita.hora]
      );
      if ((citaDuplicada?.total ?? 0) > 0) {
        resultado = { ok: false, motivo: "cita-duplicada" };
        return;
      }

      const ocupacion = await transaction.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) AS total FROM citas
         WHERE medico_id = ? AND fecha = ? AND hora = ?`,
        [cita.medicoId, cita.fecha, cita.hora]
      );
      if ((ocupacion?.total ?? 0) >= cuposMaximos) {
        resultado = { ok: false, motivo: "horario-lleno" };
        return;
      }

      await insertarCita(transaction, cita);
      if (cita.pacienteUid) {
        await encolarSincronizacion(
          transaction,
          cita.id,
          cita.pacienteUid,
          "guardar",
          cita
        );
      }
    });

    return resultado;
  }

  async listar(): Promise<Cita[]> {
    const database = await obtenerBaseDeDatos();
    const filas = await database.getAllAsync<CitaRow>("SELECT * FROM citas ORDER BY rowid");
    return filas.map(convertirCita);
  }

  async reprogramarSiDisponible(
    id: string,
    usuarioUid: string,
    pacienteDni: string,
    especialidadId: string,
    fecha: string,
    hora: string,
    cuposMaximos: number
  ): Promise<ResultadoReprogramarCita> {
    const database = await obtenerBaseDeDatos();
    let resultado: ResultadoReprogramarCita = {
      ok: false,
      motivo: "cita-no-encontrada",
    };

    await database.withExclusiveTransactionAsync(async (transaction) => {
      const fila = await transaction.getFirstAsync<CitaRow>(
        "SELECT * FROM citas WHERE id = ?",
        [id]
      );
      if (!fila) return;
      if (
        (fila.usuario_uid && fila.usuario_uid !== usuarioUid) ||
        (!fila.usuario_uid && fila.paciente_dni !== pacienteDni)
      ) {
        throw new Error("No puedes reprogramar una cita de otra cuenta.");
      }

      const citaDuplicada = await transaction.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) AS total FROM citas
         WHERE paciente_dni = ? AND fecha = ? AND hora = ? AND id <> ?`,
        [pacienteDni, fecha, hora, id]
      );
      if ((citaDuplicada?.total ?? 0) > 0) {
        resultado = { ok: false, motivo: "cita-duplicada" };
        return;
      }

      const ocupacion = await transaction.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) AS total FROM citas
         WHERE medico_id = ? AND fecha = ? AND hora = ? AND id <> ?`,
        [fila.medico_id, fecha, hora, id]
      );
      if ((ocupacion?.total ?? 0) >= cuposMaximos) {
        resultado = { ok: false, motivo: "horario-lleno" };
        return;
      }

      const cita = {
        ...convertirCita({ ...fila, usuario_uid: usuarioUid }),
        especialidadId,
        fecha,
        hora,
      };
      await transaction.runAsync(
        "UPDATE citas SET usuario_uid = ?, especialidad_id = ?, fecha = ?, hora = ? WHERE id = ?",
        [usuarioUid, especialidadId, fecha, hora, id]
      );
      await encolarSincronizacion(transaction, id, usuarioUid, "guardar", cita);
      resultado = { ok: true, cita };
    });

    return resultado;
  }

  async eliminar(id: string, usuarioUid: string): Promise<void> {
    const database = await obtenerBaseDeDatos();
    await database.withExclusiveTransactionAsync(async (transaction) => {
      const fila = await transaction.getFirstAsync<CitaRow>(
        "SELECT * FROM citas WHERE id = ?",
        [id]
      );
      if (!fila) return;
      if (fila.usuario_uid && fila.usuario_uid !== usuarioUid) {
        throw new Error("No puedes cancelar una cita de otra cuenta.");
      }

      await encolarSincronizacion(
        transaction,
        id,
        usuarioUid,
        "eliminar",
        convertirCita(fila)
      );
      await transaction.runAsync("DELETE FROM citas WHERE id = ?", [id]);
    });
  }

  async sincronizarDesdeFirestore(
    usuarioUid: string,
    citasRemotas: Cita[]
  ): Promise<void> {
    const database = await obtenerBaseDeDatos();
    await database.withExclusiveTransactionAsync(async (transaction) => {
      const pendientes = await transaction.getAllAsync<{
        cita_id: string;
      }>(
        `SELECT cita_id FROM citas_pendientes_sync WHERE usuario_uid = ?`,
        [usuarioUid]
      );
      const idsPendientes = new Set(pendientes.map((pendiente) => pendiente.cita_id));
      const idsRemotos = new Set(citasRemotas.map((cita) => cita.id));
      const locales = await transaction.getAllAsync<{ id: string }>(
        "SELECT id FROM citas WHERE usuario_uid = ?",
        [usuarioUid]
      );

      for (const cita of citasRemotas) {
        if (idsPendientes.has(cita.id)) continue;

        const filaLocal = await transaction.getFirstAsync<{
          usuario_uid: string;
          paciente_dni: string;
        }>("SELECT usuario_uid, paciente_dni FROM citas WHERE id = ?", [cita.id]);
        if (
          filaLocal &&
          filaLocal.usuario_uid !== usuarioUid &&
          (filaLocal.usuario_uid !== "" || filaLocal.paciente_dni !== cita.pacienteDni)
        ) {
          throw new Error(
            `No se pudo importar la cita ${cita.id}: el identificador ya pertenece a otra cuenta.`
          );
        }

        await reemplazarCitaSincronizada(transaction, {
          ...cita,
          pacienteUid: usuarioUid,
        });
      }

      for (const local of locales) {
        if (idsRemotos.has(local.id) || idsPendientes.has(local.id)) continue;
        await transaction.runAsync(
          "DELETE FROM citas WHERE id = ? AND usuario_uid = ?",
          [local.id, usuarioUid]
        );
      }
    });
  }

  async prepararSincronizacion(
    usuarioUid: string,
    pacienteDni: string,
    citasRemotasIds: string[]
  ): Promise<void> {
    const database = await obtenerBaseDeDatos();
    const remotas = new Set(citasRemotasIds);
    await database.withExclusiveTransactionAsync(async (transaction) => {
      const filas = await transaction.getAllAsync<CitaRow>(
        `SELECT * FROM citas
         WHERE usuario_uid = ? OR (usuario_uid = '' AND paciente_dni = ?)`,
        [usuarioUid, pacienteDni]
      );

      for (const fila of filas) {
        const cita = convertirCita({ ...fila, usuario_uid: usuarioUid });
        if (!fila.usuario_uid) {
          await transaction.runAsync(
            "UPDATE citas SET usuario_uid = ? WHERE id = ?",
            [usuarioUid, fila.id]
          );
        }

        const pendiente = await transaction.getFirstAsync<{ id: number }>(
          `SELECT id FROM citas_pendientes_sync
           WHERE usuario_uid = ? AND cita_id = ?`,
          [usuarioUid, fila.id]
        );
        if (!pendiente && !remotas.has(fila.id)) {
          await encolarSincronizacion(
            transaction,
            fila.id,
            usuarioUid,
            "guardar",
            cita
          );
        }
      }
    });
  }

  async listarPendientesSincronizacion(
    usuarioUid: string
  ): Promise<CitaPendienteSincronizacion[]> {
    const database = await obtenerBaseDeDatos();
    const filas = await database.getAllAsync<CitaPendienteRow>(
      `SELECT id, cita_id, usuario_uid, accion, cita_json
       FROM citas_pendientes_sync WHERE usuario_uid = ? ORDER BY id`,
      [usuarioUid]
    );

    return filas.map((fila) => {
      if (fila.accion === "guardar" && !fila.cita_json) {
        throw new Error(`La cita pendiente ${fila.cita_id} no tiene datos para sincronizar.`);
      }
      return {
        id: fila.id,
        citaId: fila.cita_id,
        usuarioUid: fila.usuario_uid,
        accion: fila.accion,
        cita: fila.cita_json ? JSON.parse(fila.cita_json) : null,
      };
    });
  }

  async confirmarPendienteSincronizacion(id: number): Promise<void> {
    const database = await obtenerBaseDeDatos();
    await database.runAsync("DELETE FROM citas_pendientes_sync WHERE id = ?", [id]);
  }
}
