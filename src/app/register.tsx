import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import InputField from "../components/InputField";
import Boton from "../components/boton";
import { TipoDocumento } from "../types/usuario";

interface Errores {
    documento?: string;
    verificador?: string;
    fechaNacimiento?: string;
    celular?: string;
    correo?: string;
    password?: string;
    confirmar?: string;
}

const tiposDocumento: TipoDocumento[] = ["D.N.I.", "C.E."];

export default function Register() {
    const router = useRouter();
    const [tipoDoc, setTipoDoc] = useState<TipoDocumento>("D.N.I.");
    const [documento, setDocumento] = useState("");
    const [verificador, setVerificador] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [celular, setCelular] = useState("");
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [errores, setErrores] = useState<Errores>({});

    const validar = (): boolean => {
        const nuevosErrores: Errores = {};
        const largoDoc = tipoDoc === "D.N.I." ? 8 : 9;

        if (documento.trim() === "") {
            nuevosErrores.documento = "El número de documento es obligatorio";
        } else if (documento.length !== largoDoc) {
            nuevosErrores.documento = `El documento debe tener ${largoDoc} dígitos`;
        }

        if (verificador.trim() === "") {
            nuevosErrores.verificador = "El carácter verificador es obligatorio";
        } else if (verificador.length !== 1) {
            nuevosErrores.verificador = "Debe ser 1 solo dígito";
        }

        if (fechaNacimiento.trim() === "") {
            nuevosErrores.fechaNacimiento = "La fecha de nacimiento es obligatoria";
        } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fechaNacimiento)) {
            nuevosErrores.fechaNacimiento = "Usa el formato DD/MM/AAAA";
        }

        if (celular.trim() === "") {
            nuevosErrores.celular = "El celular es obligatorio";
        } else if (celular.length !== 9) {
            nuevosErrores.celular = "El celular debe tener 9 dígitos";
        }

        if (correo.trim() === "") {
            nuevosErrores.correo = "El correo es obligatorio";
        } else if (!/\S+@\S+\.\S+/.test(correo)) {
            nuevosErrores.correo = "Escribe un correo válido";
        }

        if (password.trim() === "") {
            nuevosErrores.password = "La contraseña es obligatoria";
        } else if (password.length < 6) {
            nuevosErrores.password = "Mínimo 6 caracteres";
        }

        if (confirmar !== password) {
            nuevosErrores.confirmar = "Las contraseñas no coinciden";
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const registrar = () => {
        if (!validar()) return;

        Alert.alert("Cuenta creada", "Tu cuenta fue creada correctamente");
        router.replace("/home");
    };

    return (
        <ScrollView
            className="flex-1 bg-cyan-50"
            contentContainerClassName="px-6 pt-24 pb-10"
        >
            <View className="bg-white rounded-2xl p-5">
                <Text className="text-3xl font-bold text-center mb-6">Crear cuenta</Text>

                <Text className="text-base mb-2">Tipo de documento</Text>
                <View className="flex-row mb-4">
                    {tiposDocumento.map((opcion) => (
                        <Pressable
                            key={opcion}
                            onPress={() => setTipoDoc(opcion)}
                            className={`px-4 py-2 rounded-full mr-2 ${tipoDoc === opcion ? "bg-sky-600" : "bg-gray-200"
                                }`}
                        >
                            <Text className={tipoDoc === opcion ? "text-white" : "text-gray-700"}>
                                {opcion}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <InputField
                    icono="person"
                    placeholder="N° Documento de Identidad"
                    value={documento}
                    onChangeText={setDocumento}
                    teclado="numeric"
                    error={errores.documento}
                />
                <InputField
                    icono="id-card"
                    placeholder="Carácter verificador"
                    value={verificador}
                    onChangeText={setVerificador}
                    teclado="numeric"
                    error={errores.verificador}
                />
                <InputField
                    icono="calendar"
                    placeholder="Fecha de nacimiento (DD/MM/AAAA)"
                    value={fechaNacimiento}
                    onChangeText={setFechaNacimiento}
                    error={errores.fechaNacimiento}
                />
                <InputField
                    icono="call"
                    placeholder="Celular"
                    value={celular}
                    onChangeText={setCelular}
                    teclado="numeric"
                    error={errores.celular}
                />
                <InputField
                    icono="mail"
                    placeholder="Correo electrónico"
                    value={correo}
                    onChangeText={setCorreo}
                    teclado="email-address"
                    error={errores.correo}
                />
                <InputField
                    icono="lock-closed"
                    placeholder="Nueva contraseña"
                    value={password}
                    onChangeText={setPassword}
                    esPassword
                    error={errores.password}
                />
                <InputField
                    icono="lock-closed"
                    placeholder="Confirmar contraseña"
                    value={confirmar}
                    onChangeText={setConfirmar}
                    esPassword
                    error={errores.confirmar}
                />

                <Boton titulo="Registrarme" onPress={registrar} />
                <View className="h-3" />
                <Boton
                    titulo="Volver"
                    variante="secundario"
                    onPress={() => router.back()}
                />
            </View>
        </ScrollView>
    );
}