import { useEffect } from "react";
import { router, useRouter } from "expo-router";
import { View } from "react-native";

export default function Index() {

  useEffect(() => {
    const timeOut = setTimeout(() => {
      router.replace('/login');
    }, 0);

    return ()=> clearTimeout(timeOut);
  },[])

  return <View className='flex-1 bg-slate-100'></View>

  /* const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return null; */
}