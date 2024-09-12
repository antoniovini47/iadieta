import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatMessageProps } from "@/components/ChatMessage";
import initialMessages from "@/assets/messages";

export async function saveMessages(messages: ChatMessageProps[]) {
  try {
    const jsonValue = JSON.stringify(messages);
    await AsyncStorage.setItem("messages", jsonValue);
  } catch (error) {
    console.error("Error saving messages", error);
  }
}

export const loadMessages = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("messages");
    return jsonValue != null
      ? JSON.parse(jsonValue)
      : [
          ...initialMessages,
          {
            type: "fromSystem",
            text: "Erro ao carregar mensagens antigas...",
            createdAt: new Date(),
          },
        ];
  } catch (error) {
    console.error("Error loading messages", error);
  }
};
