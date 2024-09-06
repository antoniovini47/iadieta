import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import showToast from "@/hooks/useToast";

export default function TokensButton(props: { tokens: number; handleClick: Function }) {
  return (
    <View style={{ flexDirection: "row" }}>
      <Pressable onPress={() => props.handleClick()}>
        <Ionicons name="diamond" style={{ fontSize: 36, color: "#FFF" }} />
      </Pressable>
      <Text style={{ color: "#F00", fontSize: 12 }}>{props.tokens}</Text>
    </View>
  );
}
