import api from '../../utils/axios';

/**
 * Streams real-time agent execution events and returns final response
 * @param {FormData} payload - form data containing prompt, conversationId, agent, file
 * @param {Function} onStatus - callback triggered whenever an agent step changes
 */
export async function sendMessageStream(payload, onStatus = () => {}) {
    const serverUrl = import.meta.env.VITE_SERVER_URL || "";
    const streamEndpoint = `${serverUrl}/api/agent/chat-stream`;

    try {
        const response = await fetch(streamEndpoint, {
            method: "POST",
            body: payload,
            credentials: "include" // Passes the session cookie to the gateway
        });

        if (!response.ok || !response.body) {
            throw new Error(`Stream request failed with status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalResult = null;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split("\n\n");
            buffer = parts.pop() || ""; // Keep any trailing partial chunk

            for (const part of parts) {
                const lines = part.split("\n");
                let eventType = "message";
                let eventData = "";

                for (const line of lines) {
                    if (line.startsWith("event: ")) {
                        eventType = line.slice(7).trim();
                    } else if (line.startsWith("data: ")) {
                        eventData = line.slice(6).trim();
                    }
                }

                if (!eventData) continue;

                try {
                    const parsedData = JSON.parse(eventData);

                    if (eventType === "status") {
                        onStatus(parsedData);
                    } else if (eventType === "result") {
                        finalResult = parsedData;
                    }
                } catch (e) {
                    console.warn("SSE parse error:", e);
                }
            }
        }

        if (finalResult) {
            return finalResult;
        }

        // Fallback: If no result was parsed from stream, try standard endpoint
        throw new Error("Stream closed without final result");

    } catch (streamError) {
        console.warn("Streaming unavailable, falling back to standard endpoint:", streamError);
        const { data } = await api.post("/api/agent/chat", payload);
        return data;
    }
}

/**
 * Standard synchronous request
 */
async function sendMessage(payload) {
    try {
        const { data } = await api.post("/api/agent/chat", payload);
        return data;
    } catch (error) {
        console.error("sendMessage error:", error);
        return null;
    }
}

export default sendMessage;
