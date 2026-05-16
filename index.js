/**
 * Punto de entrada de la app Expo/React Native.
 * Registra el componente raíz para que Expo Go y builds nativos arranquen bien.
 */
// Importa la función que registra el componente principal en el registro de la app nativa.
import { registerRootComponent } from "expo";

// Importa el componente raíz de la aplicación (árbol de navegación y pantallas).
import App from "./App";

// Registra `App` como componente "main": equivale a AppRegistry.registerComponent en RN puro.
registerRootComponent(App);
