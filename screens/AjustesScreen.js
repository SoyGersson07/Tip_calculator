// ========== IMPORTACIONES ==========
import {
  StyleSheet, // Para crear estilos CSS-like en React Native
  Text, // Componente para mostrar texto
  View, // Contenedor básico (como div en web)
  TouchableOpacity, // Botón/área tocable con efecto de opacidad
  SafeAreaView, // Evita que el contenido se corte por notches/barras de sistema
  ScrollView, // Área que se puede desplazar cuando hay mucho contenido
  Switch, // Toggle on/off
  Image, // Para mostrar imágenes (aunque aquí no se usa)
} from "react-native";

import { useState, useCallback } from "react"; // Hooks de React para manejar estado local
import { useFocusEffect } from "@react-navigation/native"; // Hook para ejecutar código cuando la pantalla entra en foco
import { guardarRedondeo, obtenerRedondeo } from "../settingsStorage"; // Funciones para manejar preferencias

// ========== PALETA DE COLORES GLOBALES ==========
const C = {
  primary: "#E2725B", // Color coral/naranja principal
  primaryLight: "#FDF0ED", // Versión clara del color principal
  bgMain: "#F6F4F0", // Color de fondo principal (beige claro)
  white: "#FFFFFF", // Blanco puro
  darkText: "#1C1C1E", // Texto oscuro/negro
  gray500: "#8E8E93", // Gris medio (para texto secundario)
  gray200: "#E5E5EA", // Gris claro (para bordes)
  gray100: "#F2F2F7", // Gris muy claro (para fondos suaves)
};

// ========== COMPONENTE: ETIQUETA DE SECCIÓN ==========
// Muestra un título en mayúsculas para cada sección (PREFERENCIAS, PERSONALIZACIÓN, etc)
function SectionLabel({ label }) {
  return <Text style={s.sectionLabel}>{label}</Text>;
}

// ========== COMPONENTE: FILA CON ICONO, TÍTULO Y ACCIÓN ==========
// Componente reutilizable para mostrar cada opción en los ajustes
function RowItem({ icon, title, subtitle, right, onPress, isLast }) {
  return (
    <TouchableOpacity
      style={[
        s.row, // Estilos base de la fila
        !isLast && s.rowBorder, // Agrega borde inferior si NO es la última fila
      ]}
      onPress={onPress} // Función que se ejecuta si se toca
      activeOpacity={onPress ? 0.7 : 1} // Si hay onPress, reduce opacidad al tocar (efecto visual)
    >
      {/* LADO IZQUIERDO: ICONO */}
      <View style={s.rowIcon}>{icon}</View>

      {/* CENTRO: TÍTULO Y SUBTÍTULO */}
      <View style={s.rowInfo}>
        <Text style={s.rowTitle}>{title}</Text>
        {/* Solo muestra subtitle si existe */}
        {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
      </View>

      {/* LADO DERECHO: SWITCH O VALOR O FLECHA */}
      <View style={s.rowRight}>{right}</View>
    </TouchableOpacity>
  );
}

// ========== COMPONENTE PRINCIPAL: PANTALLA DE AJUSTES ==========
export default function AjustesScreen({ navigation }) {
  // Estados locales para guardar preferencias del usuario
  const [redondeo, setRedondeo] = useState(true); // Redondeo: ON por defecto
  const [temaOscuro, setTemaOscuro] = useState(false); // Tema oscuro: OFF por defecto

  // Cargar preferencias cuando la pantalla entra en foco
  useFocusEffect(
    useCallback(() => {
      obtenerRedondeo().then(setRedondeo);
    }, [])
  );

  // Guardar redondeo cuando cambia
  const handleRedondeoChange = (valor) => {
    setRedondeo(valor);
    guardarRedondeo(valor);
  };

  return (
    // Vista segura que respeta notches y barras del sistema
    <SafeAreaView style={s.safe}>
      {/* ========== HEADER ==========*/}
      <View style={s.header}>
        {/* Botón atrás */}
        <TouchableOpacity
          onPress={() => navigation.goBack()} // Vuelve a la pantalla anterior
          style={s.backBtn}
        >
          <Text style={s.backIcon}>←</Text> {/* Flecha hacia atrás */}
        </TouchableOpacity>

        {/* Título de la pantalla */}
        <Text style={s.headerTitle}>Ajustes</Text>

        {/* Espacio en blanco para centrar el título (36px de ancho) */}
        <View style={{ width: 36 }} />
      </View>

      {/* ========== CONTENIDO SCROLLEABLE ==========*/}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false} // Oculta la barra de scroll
      >
        {/* ========== SECCIÓN 1: PREFERENCIAS DE CÁLCULO ==========*/}
        <SectionLabel label="PREFERENCIAS DE CÁLCULO" />

        <View style={s.card}>
          {/* Opción 1: Moneda predeterminada (sin acción actual) */}
          <RowItem
            icon={
              <Image
                source={require("../assets/commerce.png")}
                style={s.iconImg}
              />
            } // Icono de tarjeta
            title="Moneda predeterminada"
            subtitle="Selecciona el símbolo local"
            right={<Text style={s.rowValue}>USD ($) ›</Text>} // Muestra valor actual + flecha
          />

          {/* Opción 2: Redondeo automático (con Switch) */}
          <RowItem
            icon={<Text style={s.plusIcon}>+1</Text>} // Símbolo +1
            title="Redondeo automático"
            subtitle="Ajustar al entero más cercano"
            right={
              <Switch // Toggle on/off
                value={redondeo} // Estado actual del switch
                onValueChange={handleRedondeoChange} // Función para cambiar el estado y guardar
                trackColor={{ false: C.gray200, true: C.primary }} // Color del fondo
                thumbColor={C.white} // Color del círculo deslizable
              />
            }
            isLast // Esta es la última fila, así que no mostrar borde inferior
          />
        </View>

        {/* ========== SECCIÓN 2: PERSONALIZACIÓN ==========*/}
        <SectionLabel label="PERSONALIZACIÓN" />

        <View style={s.card}>
          {/* Opción 1: Tema Oscuro (con Switch) */}
          <RowItem
            icon={<Image source={require("../assets/moon.png")} style={s.iconImg}/>} // Icono de luna
            title="Tema Oscuro"
            subtitle="Cambiar la apariencia visual"
            right={
              <Switch
                value={temaOscuro} // Estado actual
                onValueChange={setTemaOscuro} // Cambiar estado
                trackColor={{ false: C.gray200, true: C.primary }}
                thumbColor={C.white}
              />
            }
          />

          {/* Opción 2: Idioma (sin acción actual) */}
          <RowItem
            icon={<Image source={require("../assets/globe.png")} style={s.iconImg}/>} // Icono globo terráqueo
            title="Idioma"
            subtitle="App en tu lengua nativa"
            right={<Text style={s.rowValue}>Español ›</Text>} // Idioma actual + flecha
            isLast // Última fila de la sección
          />
        </View>

        {/* ========== SECCIÓN 3: SOPORTE ==========*/}
        <SectionLabel label="SOPORTE" />

        <View style={s.card}>
          {/* Opción 1: Ayuda y Preguntas (sin acción actual) */}
          <RowItem
            icon={<Image source={require("../assets/question.png")} style={s.iconImg}/>}  // Icono pregunta
            title="Ayuda y Preguntas"
            subtitle="Centro de soporte al usuario"
            right={<Text style={s.rowChevron}>⇗</Text>} // Flecha diagonal (ir a web)
          />

          {/* Opción 2: Contáctanos (sin acción actual) */}
          <RowItem
            icon={<Image source={require("../assets/support.png")} style={s.iconImg}/>} // Icono de contacto
            title="Contáctanos"
            subtitle="Reporta un error o sugiere algo"
            right={<Text style={s.rowChevron}>›</Text>} // Flecha derecha
            isLast // Última fila de toda la sección
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ========== ESTILOS ==========
const s = StyleSheet.create({
  // Contenedor principal
  safe: {
    flex: 1, // Ocupa todo el espacio disponible
    backgroundColor: C.bgMain, // Fondo beige claro
  },

  // Header (barra superior)
  header: {
    flexDirection: "row", // Elementos en fila horizontal
    alignItems: "center", // Verticalmente centrados
    justifyContent: "space-between", // Espaciado entre elementos
    backgroundColor: C.white, // Fondo blanco
    paddingHorizontal: 16, // 16px a los lados
    paddingVertical: 14, // 14px arriba y abajo
    borderBottomWidth: 1, // Línea divisoria inferior
    borderBottomColor: C.gray200, // Color de la línea
  },

  // Botón atrás
  backBtn: {
    width: 36, // Cuadrado de 36x36 para fácil toque
  },

  // Icono de flecha atrás
  backIcon: {
    fontSize: 22, // Tamaño del ícono
    color: C.darkText, // Color oscuro
  },

  // Título del header
  headerTitle: {
    fontSize: 16, // Tamaño moderado
    fontWeight: "700", // Negrita
    color: C.darkText,
  },

  // Scroll view
  scroll: {
    flex: 1, // Ocupa espacio disponible
  },

  // Contenido dentro del scroll
  scrollContent: {
    padding: 16, // 16px de padding en todos los lados
    paddingBottom: 40, // 40px abajo para dejar espacio
  },

  // Etiqueta de sección (PREFERENCIAS, PERSONALIZACIÓN, etc)
  sectionLabel: {
    fontSize: 11, // Texto pequeño
    fontWeight: "800", // Muy negrita
    color: C.primary, // Color coral
    letterSpacing: 1.2, // Espaciado entre letras
    marginBottom: 8, // 8px debajo
    marginTop: 16, // 16px arriba
  },

  // Tarjeta blanca que contiene las filas
  card: {
    backgroundColor: C.white, // Fondo blanco
    borderRadius: 16, // Esquinas redondeadas
    overflow: "hidden", // Oculta contenido que se sale
    // Sombra (para dar profundidad)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2, // Sombra para Android
  },

  // Cada fila dentro de la tarjeta
  row: {
    flexDirection: "row", // Elementos en fila
    alignItems: "center", // Verticalmente centrados
    paddingHorizontal: 16, // 16px a los lados
    paddingVertical: 14, // 14px arriba y abajo
  },

  // Borde inferior en filas que no son la última
  rowBorder: {
    borderBottomWidth: 1, // Línea de 1px
    borderBottomColor: C.gray100, // Color gris muy claro
  },

  // Contenedor del icono a la izquierda
  rowIcon: {
    width: 36, // Cuadrado 36x36
    height: 36,
    borderRadius: 10, // Esquinas redondeadas
    backgroundColor: C.primaryLight, // Fondo coral claro
    alignItems: "center", // Centra el icono
    justifyContent: "center",
    marginRight: 12, // 12px de espacio a la derecha
  },

  // Tamaño del emoji/icono
  emoji: {
    fontSize: 16, // Tamaño del emoji
  },

  // Contenedor del título y subtítulo
  rowInfo: {
    flex: 1, // Ocupa el espacio disponible (empuja lo demás a la derecha)
  },

  // Título de la fila
  rowTitle: {
    fontSize: 15, // Tamaño normal
    fontWeight: "600", // Semi-negrita
    color: C.darkText,
  },

  // Subtítulo de la fila
  rowSub: {
    fontSize: 12, // Más pequeño
    color: C.gray500, // Color gris
    marginTop: 2, // 2px abajo del título
  },

  // Contenedor del lado derecho (switch/valor/flecha)
  rowRight: {
    marginLeft: 8, // 8px de espacio a la izquierda
  },

  // Valor mostrado (como "USD ($)")
  rowValue: {
    fontSize: 13, // Pequeño
    fontWeight: "600", // Semi-negrita
    color: C.primary, // Color coral
  },

  // Icono de flecha/chevron
  rowChevron: {
    fontSize: 18, // Tamaño grande
    color: C.gray500, // Color gris
  },

  // Imagen del icono (commerce.png)
  iconImg: {
    width: 20, // Ancho controlado
    height: 20, // Alto controlado
    resizeMode: "contain", // Ajusta la imagen sin distorsionar
  },

  plusIcon: {
    fontSize: 16,
    fontWeight: "700",
    color: C.primary,
  },
});
