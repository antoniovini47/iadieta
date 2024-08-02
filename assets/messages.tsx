import { ChatMessageProps } from "@/components/ChatMessage";

const initialMessages: ChatMessageProps[] = [
  { type: "fromSystem", text: "Oi! Seja bem-vindo(a) ao app", createdAt: new Date() },
  { type: "fromSystem", text: "IA, Dieta?", createdAt: new Date() },
  {
    type: "fromAI",
    text: "Comece enviando a foto de uma comida para que eu analise utilizando Inteligencia Artificial!",
    createdAt: new Date(),
  },
];

export default initialMessages;
