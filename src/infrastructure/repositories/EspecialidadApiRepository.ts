import AsyncStorage from "@react-native-async-storage/async-storage";
import { Especialidad, Medico, Modalidad } from "../../domain/entities/Especialidad";
import { EspecialidadRepository } from "../../domain/repositories/EspecialidadRepository";

const URL_ESPECIALIDADES = "https://aplicacion-movil-wa4w.onrender.com/especialidades";
const CLAVE_CACHE_ESPECIALIDADES = "catalogo-especialidades:v1";

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function esModalidad(valor: unknown): valor is Modalidad {
  return valor === "Presencial" || valor === "Virtual";
}

function esMedico(valor: unknown): valor is Medico {
  return (
    esObjeto(valor) &&
    typeof valor.id === "string" &&
    typeof valor.nombre === "string" &&
    typeof valor.consultorio === "string" &&
    esModalidad(valor.modalidad) &&
    typeof valor.diasAdelante === "number" &&
    typeof valor.hora === "string"
  );
}

function esEspecialidad(valor: unknown): valor is Especialidad {
  return (
    esObjeto(valor) &&
    typeof valor.id === "string" &&
    typeof valor.nombre === "string" &&
    typeof valor.servicio === "string" &&
    typeof valor.icono === "string" &&
    Array.isArray(valor.medicos) &&
    valor.medicos.every(esMedico)
  );
}

export class EspecialidadApiRepository implements EspecialidadRepository {
  private actualizacionEnCurso: Promise<Especialidad[]> | null = null;

  async obtenerTodas(): Promise<Especialidad[]> {
    let catalogoGuardado: Especialidad[] | null = null;
    try {
      const cache = await AsyncStorage.getItem(CLAVE_CACHE_ESPECIALIDADES);
      if (cache) {
        const datos: unknown = JSON.parse(cache);
        if (Array.isArray(datos) && datos.every(esEspecialidad)) {
          catalogoGuardado = datos;
        } else {
          console.warn("El catálogo local tenía un formato no válido; se descargará de nuevo.");
          await AsyncStorage.removeItem(CLAVE_CACHE_ESPECIALIDADES);
        }
      }
    } catch (error) {
      console.warn("No se pudo leer el catálogo local de especialidades.", error);
    }

    if (catalogoGuardado) {
      void this.descargarYGuardar().catch((error: unknown) => {
        console.warn(
          "No se pudo actualizar el catálogo guardado; se mostrarán los datos del teléfono.",
          error
        );
      });
      return catalogoGuardado;
    }

    return this.descargarYGuardar();
  }

  private descargarYGuardar(): Promise<Especialidad[]> {
    if (this.actualizacionEnCurso) return this.actualizacionEnCurso;

    const actualizacion = this.descargarCatalogo();
    this.actualizacionEnCurso = actualizacion;
    void actualizacion.finally(() => {
      if (this.actualizacionEnCurso === actualizacion) {
        this.actualizacionEnCurso = null;
      }
    }).catch(() => undefined);
    return actualizacion;
  }

  private async descargarCatalogo(): Promise<Especialidad[]> {
    const respuesta = await fetch(URL_ESPECIALIDADES);
    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar el catálogo de especialidades (HTTP ${respuesta.status}).`);
    }

    const datos: unknown = await respuesta.json();
    if (!Array.isArray(datos) || !datos.every(esEspecialidad)) {
      throw new Error("La API devolvió un catálogo de especialidades con formato no válido.");
    }

    try {
      await AsyncStorage.setItem(CLAVE_CACHE_ESPECIALIDADES, JSON.stringify(datos));
    } catch (error) {
      console.warn("No se pudo guardar una copia local del catálogo.", error);
    }

    return datos;
  }
}
