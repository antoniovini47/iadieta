import Toast from "react-native-root-toast";

export default function showToast(msg: string) {
  Toast.show(msg, {
    duration: Toast.durations.SHORT,
    position: Toast.positions.CENTER,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
  });
}
