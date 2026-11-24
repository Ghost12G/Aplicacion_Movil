import { useEffect } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import {
  authService,
  citaService,
  citaFirestoreSyncService,
} from "../../infrastructure/container";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    let activo = true;
    void citaService.obtenerEspecialidades().catch((error: unknown) => {
      console.warn("No se pudo precargar el catálogo de especialidades.", error);
    });

    const iniciar = async () => {
      // Se muestra el logo al menos 1.5 s mientras se revisa si ya había una sesión
      const [usuario] = await Promise.all([
        authService.restaurarSesion().catch(() => null),
        new Promise((resolver) => setTimeout(resolver, 1500)),
      ]);

      if (activo) {
        if (usuario) {
          void citaFirestoreSyncService.sincronizarPendientes().catch((error: unknown) => {
            console.error("Las citas siguen pendientes de sincronización.", error);
          });
        }
        router.replace(usuario ? "/home" : "/login");
      }
    };

    iniciar();
    return () => {
      activo = false;
    };
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-sky-50">
      <Image
        source={require("../../../assets/images/logo-clinic-digital.png")}
        className="w-64 h-72"
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#0369a1" />
    </View>
  );
}
