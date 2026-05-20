import { Alert } from "react-native";

export function confirmAction({
  title,
  message,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  destructive = false,
  onConfirm,
}) {
  Alert.alert(
    title,
    message,
    [
      { text: cancelText, style: "cancel" },
      {
        text: confirmText,
        style: destructive ? "destructive" : "default",
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
}
