/**
 * Barra superior al teclado en iOS (Listo / Done) cuando no hay botón nativo — p. ej. teclado numérico.
 */
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "../config/constants";

/** Mismo id para todos los campos que comparten esta toolbar. */
export const KEYBOARD_DONE_ACCESSORY_ID = "tip_calc_keyboard_done";

export function KeyboardDoneAccessory() {
  if (Platform.OS !== "ios") return null;

  return (
    <InputAccessoryView nativeID={KEYBOARD_DONE_ACCESSORY_ID}>
      <View style={styles.bar}>
        <TouchableOpacity onPress={() => Keyboard.dismiss()} hitSlop={12}>
          <Text style={styles.done}>Listo</Text>
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.gray300,
    backgroundColor: Colors.gray100,
  },
  done: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.primary,
  },
});
