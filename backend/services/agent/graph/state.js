import { Annotation } from "@langchain/langgraph";

export const agentState = Annotation.Root({
    prompt: Annotation(),
    aiResponse: Annotation(),
    agent: Annotation(),
    conversationId: Annotation(),
    searchResults: Annotation(),
    images: Annotation(),
    artifacts: Annotation(),
    userId: Annotation(),
    file: Annotation(),
    
    // Cross-Agent Collaboration & Verification
    verification: Annotation(),
    retryCount: Annotation(),
    team: Annotation(),
    sharedContext: Annotation()
});
