import { useEffect } from "react";
import { View, Image } from "react-native";
import { useRouter } from "expo-router";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-sky-50">
      <Image
        source={require("../../../assets/images/logo-clinic-digital.png")}
        className="w-64 h-72"
        resizeMode="contain"
      />
    </View>
  );
}
