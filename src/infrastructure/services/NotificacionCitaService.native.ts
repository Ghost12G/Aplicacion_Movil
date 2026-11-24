import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Cita } from "../../domain/entities/Cita";
import { fechaHoraDe } from "../../shared/fechas";
import type { ResultadoRecordatorio } from "./NotificacionCitaService.types";

const CANAL_RECORDATORIOS = "recordatorios-citas";
const DURACION_ANTICIPACION_MS = 24 * 60 * 60 * 1000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function tienePermiso(permiso: Notifications.NotificationPermissionsStatus): boolean {
  return (
    permiso.granted ||
    permiso.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export class NotificacionCitaService {
  async programarRecordatorio(cita: Cita): Promise<ResultadoRecordatorio> {
    try {
      await this.cancelarRecordatorio(cita.id);
      const fechaRecordatorio = new Date(
        fechaHoraDe(cita.fecha, cita.hora).getTime() - DURACION_ANTICIPACION_MS
      );
      if (fechaRecordatorio.getTime() <= Date.now()) {
        return { estado: "menos-de-24-horas" };
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(CANAL_RECORDATORIOS, {
          name: "Recordatorios de citas",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      let permiso = await Notifications.getPermissionsAsync();
      if (!tienePermiso(permiso)) {
        permiso = await Notifications.requestPermissionsAsync({
          ios: { allowAlert: true, allowBadge: false, allowSound: false },
        });
      }
      if (!tienePermiso(permiso)) {
        return { estado: "permiso-denegado" };
      }
      if (fechaRecordatorio.getTime() <= Date.now()) {
        return { estado: "menos-de-24-horas" };
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Recordatorio de cita",
          body: "Tienes una cita mañana.",
          data: { citaId: cita.id },
        },
        trigger:
          Platform.OS === "android"
            ? {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: fechaRecordatorio,
                channelId: CANAL_RECORDATORIOS,
              }
            : {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: fechaRecordatorio,
              },
      });

      return { estado: "programado" };
    } catch (error) {
      console.warn("No se pudo programar el recordatorio local.", error);
      return { estado: "error" };
    }
  }

  async cancelarRecordatorio(citaId: string): Promise<void> {
    const notificaciones = await Notifications.getAllScheduledNotificationsAsync();
    const identificadores = notificaciones
      .filter((notificacion) => notificacion.content.data?.citaId === citaId)
      .map((notificacion) => notificacion.identifier);

    await Promise.all(
      identificadores.map((identificador) =>
        Notifications.cancelScheduledNotificationAsync(identificador)
      )
    );
  }
}
