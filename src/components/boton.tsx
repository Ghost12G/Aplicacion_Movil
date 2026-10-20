import { Pressable, Text, View } from "react-native";

interface Props{
    titulo:string;
    onPress:()=> void;
    variante? :"primario" | "secundario";
}

export default function Boton({titulo, onPress, variante='primario'}:Props){
    const color = variante === "primario" ? "bg-sky-600": "bg-sky-900";
    return(
        <Pressable onPress={onPress} className={`${color} py-3 rounded-full items-center`}>
            <Text className="text-white text-lg">{titulo}</Text>
        </Pressable>
    )
}