import { ChatMessage } from "../types";

export interface CampusNavigatorAiResponse {
  text: string;
  destinationId?: string | null;
  originId?: string | null;
  modelUsed?: string;
}

export async function askCampusNavigatorAI(
  prompt: string,
  currentOriginId: string = "gate-2",
  history: ChatMessage[] = []
): Promise<CampusNavigatorAiResponse> {
  const response = await fetch("/api/chat/navigate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      currentOriginId,
      history: history.map((h) => ({
        role: h.role,
        content: h.content,
      })),
    }),
  });

  if (!response.ok) {
    let errorMsg = `Server error (HTTP ${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson?.error) {
        errorMsg = errJson.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data;
}
