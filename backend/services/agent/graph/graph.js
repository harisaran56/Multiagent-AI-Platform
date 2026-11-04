import { StateGraph } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { router } from "./router.js";
import { chatAgent } from "../agents/chat.agent.js";
import { searchAgent } from "../agents/search.agent.js";
import { codingAgent } from "../agents/coding.agent.js";
import { pdfAgent } from "../agents/pdf.agent.js";
import { pptAgent } from "../agents/ppt.agent.js";
import { visionAgent } from "../agents/vision.agent.js";
import { pdfRag } from "../agents/pdfRag.agent.js";
import { imageAnalyzer } from "../agents/imageAnalyzer.agent.js";
import { verifierAgent } from "../agents/verifier.agent.js";

const workflow = new StateGraph(agentState);

// 1. Worker & Specialist Nodes
workflow.addNode("router", router);
workflow.addNode("chat", chatAgent);
workflow.addNode("search", searchAgent);
workflow.addNode("coding", codingAgent);
workflow.addNode("pdf", pdfAgent);
workflow.addNode("ppt", pptAgent);
workflow.addNode("vision", visionAgent);
workflow.addNode("pdfRag", pdfRag);
workflow.addNode("imageAnalyzer", imageAnalyzer);

// 2. Cross-Agent Verifier / Quality Gate Node
workflow.addNode("verifier", verifierAgent);

// 3. Routing Edges
workflow.addEdge("__start__", "router");

workflow.addConditionalEdges("router", (state) => {
    switch (state.agent) {
        case "chat":
            return "chat";
        case "search":
            return "search";
        case "coding":
            return "coding";
        case "pdf":
            return "pdf";
        case "ppt":
            return "ppt";
        case "vision":
            return "vision";
        case "pdfRag":
            return "pdfRag";
        case "imageAnalyzer":
            return "imageAnalyzer";  
        default:
            return "chat";
    }
}, {
    chat: "chat",
    search: "search",
    coding: "coding",
    pdf: "pdf",
    ppt: "ppt",
    vision: "vision",
    pdfRag: "pdfRag",
    imageAnalyzer: "imageAnalyzer"
});

// Search routes into chat for answer synthesis
workflow.addEdge("search", "chat");

// All worker outputs now route to the Verifier before completion
workflow.addEdge("chat", "verifier");
workflow.addEdge("coding", "verifier");
workflow.addEdge("pdf", "verifier");
workflow.addEdge("ppt", "verifier");
workflow.addEdge("vision", "verifier");
workflow.addEdge("pdfRag", "verifier");
workflow.addEdge("imageAnalyzer", "verifier");

// Verifier outputs the final approved response
workflow.addEdge("verifier", "__end__");

export const graph = workflow.compile();
