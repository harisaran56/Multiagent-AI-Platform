import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";

/**
 * Standard HTTP Request/Response (Synchronous)
 */
export const agent = async (req, res, next) => {
    try {
        const { prompt, conversationId, agent } = req.body;
        const file = req.file;
        const userId = req.headers["x-user-id"];

        // 1. Save user prompt to Chat Service
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId,
            role: "user",
            content: prompt
        });

        // 2. Execute LangGraph workflow (Workers -> Verifier)
        const result = await graph.invoke({
            prompt,
            conversationId,
            agent,
            userId,
            file
        });

        // 3. Save memory in Redis
        await addMessage(conversationId, "user", prompt);
        await addMessage(conversationId, "assistant", result.aiResponse);

        // 4. Save verified assistant response to Chat Service
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId,
            role: "assistant",
            content: result?.aiResponse,
            images: result?.images,
            artifacts: result?.artifacts,
            verification: result?.verification
        });

        // 5. Return complete response with verification details to frontend
        return res.status(200).json({
            answer: result?.aiResponse,
            images: result?.images,
            artifacts: result?.artifacts,
            verification: result?.verification
        });
       
    } catch (error) {
        next(error);
    }
};

/**
 * Real-Time Streaming Endpoint (Server-Sent Events)
 * Streams agent activity, step transitions, and final results to the client.
 */
export const agentStream = async (req, res) => {
    try {
        const { prompt, conversationId, agent } = req.body;
        const file = req.file;
        const userId = req.headers["x-user-id"];

        // 1. Setup Server-Sent Events headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no"); // Disable buffering in reverse proxies
        res.flushHeaders?.();

        const sendEvent = (event, data) => {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        // Notify UI that the request has been received
        sendEvent("status", {
            agent: "router",
            message: "Analyzing prompt & selecting agent...",
            timestamp: Date.now()
        });

        // Save user prompt to Chat Service
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId,
            role: "user",
            content: prompt
        });

        let finalResult = {
            aiResponse: "",
            images: [],
            artifacts: [],
            verification: null
        };

        // 2. Stream LangGraph execution node-by-node
        const stream = await graph.stream({
            prompt,
            conversationId,
            agent,
            userId,
            file
        }, {
            streamMode: "updates"
        });

        for await (const chunk of stream) {
            for (const [nodeName, nodeOutput] of Object.entries(chunk)) {
                if (nodeName === "router") {
                    sendEvent("status", {
                        agent: nodeOutput.agent || "chat",
                        message: `Routed to ${nodeOutput.agent || "chat"} agent. Generating response...`,
                        timestamp: Date.now()
                    });
                } else if (nodeName === "search") {
                    sendEvent("status", {
                        agent: "search",
                        message: "Searching the web for current data...",
                        timestamp: Date.now()
                    });
                } else if (nodeName === "verifier") {
                    sendEvent("status", {
                        agent: "verifier",
                        message: "Quality Gate: Verifying prompt alignment and syntax...",
                        timestamp: Date.now()
                    });
                } else {
                    sendEvent("status", {
                        agent: nodeName,
                        message: `${nodeName.toUpperCase()} agent completed its step.`,
                        timestamp: Date.now()
                    });
                }

                // Collect final outputs from nodes
                if (nodeOutput.aiResponse) finalResult.aiResponse = nodeOutput.aiResponse;
                if (nodeOutput.images) finalResult.images = nodeOutput.images;
                if (nodeOutput.artifacts) finalResult.artifacts = nodeOutput.artifacts;
                if (nodeOutput.verification) finalResult.verification = nodeOutput.verification;
            }
        }

        // 3. Persist conversation in Redis memory
        await addMessage(conversationId, "user", prompt);
        await addMessage(conversationId, "assistant", finalResult.aiResponse);

        // 4. Save verified assistant message in MongoDB
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId,
            role: "assistant",
            content: finalResult.aiResponse,
            images: finalResult.images,
            artifacts: finalResult.artifacts,
            verification: finalResult.verification
        });

        // 5. Emit final result to frontend
        sendEvent("result", {
            answer: finalResult.aiResponse,
            images: finalResult.images,
            artifacts: finalResult.artifacts,
            verification: finalResult.verification
        });

        sendEvent("done", { success: true });
        res.end();

    } catch (error) {
        console.error("agentStream error:", error);
        res.write(`event: error\ndata: ${JSON.stringify({ message: error?.message || "Streaming failed" })}\n\n`);
        res.end();
    }
};
