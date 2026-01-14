
import { Customer } from "../../types";
import { ai, MODEL_FAST } from "./client";
import { getChatSystemInstruction, getRolePlaySystemInstruction } from "../../prompts/index";

// 5. Chat Assistant
export const sendChatMessage = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string,
  customerContext: Customer
) => {
  const systemInstruction = getChatSystemInstruction(customerContext);

  const chat = ai.chats.create({
    model: MODEL_FAST,
    config: { systemInstruction },
    history: history,
  });

  return chat.sendMessageStream({ message: newMessage });
};

// 10. AI Role Play Chat
export const startRolePlaySession = async (
    history: { role: 'user' | 'model'; parts: { text: string }[] }[],
    newMessage: string,
    customer: Customer,
    targetStakeholder: any
) => {
    const systemInstruction = getRolePlaySystemInstruction(customer, targetStakeholder);

    const chat = ai.chats.create({
        model: MODEL_FAST,
        config: { systemInstruction },
        history: history
    });

    return chat.sendMessageStream({ message: newMessage });
};
