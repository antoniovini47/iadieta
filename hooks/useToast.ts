import { ToastAndroid } from "react-native";

export default function showToast(msg: string) {
  ToastAndroid.showWithGravity(
    msg,
    __DEV__ ? ToastAndroid.SHORT : ToastAndroid.LONG,
    ToastAndroid.TOP
  );
}
