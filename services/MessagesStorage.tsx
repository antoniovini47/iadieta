import AsyncStorage from "@react-native-async-storage/async-storage";
import initialMessages from "../assets/messages";
import { ChatMessageProps } from "@/components/ChatMessage";

export async function saveMessages(messages: ChatMessageProps[]) {
  try {
    const jsonValue = JSON.stringify(messages);
    await AsyncStorage.setItem("messages", jsonValue);
  } catch (error) {
    console.error("Error saving messages", error);
  }
}

export async function loadMessages() {
  try {
    const jsonValue = await AsyncStorage.getItem("messages");
    return jsonValue != null ? JSON.parse(jsonValue) : initialMessages[0];
  } catch (error) {
    console.error("Error loading messages", error);
  }
}
