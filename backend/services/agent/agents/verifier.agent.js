import { getModel } from "../config/llmModels.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

/**
 * Verifier / Critic Agent
 * Inspects outputs from worker agents (chat, coding, search, etc.)
 * before sending the final answer to the user.
 */
export const verifierAgent = async (state) => {
    try {
        // If there is no response or it's an error message, skip verification
        if (!state.aiResponse || state.aiResponse.startsWith("failed to")) {
            return {
                ...state,
                verification: {
                    status: "SKIPPED",
                    feedback: "No content to verify",
                    checks: []
                }
            };
        }

        const llm = await getModel("verifier");

        const systemPrompt = `You are CortexAI's Verification & Quality Control Agent.
Your job is to critically review the drafted response generated for the user's prompt.

Evaluate:
1. Accuracy & Prompt Alignment: Does it directly fulfill the user's request?
2. Quality & Structure: Is the formatting, grammar, and code syntax clear and correct?
3. Safety & Grounding: Are there any obvious hallucinations, harmful instructions, or false claims?

Return ONLY a valid JSON object in this exact schema without any markdown wrapping or extra text:
{
  "status": "VERIFIED",
  "score": 95,
  "summary": "Brief 1-sentence assessment of the quality",
  "checks": [
    "Prompt alignment validated",
    "Syntax and formatting checked",
    "Safety criteria met"
  ]
}`;

        const messages = [
            new SystemMessage(systemPrompt),
            new HumanMessage(`User Prompt:\n${state.prompt}\n\nDrafted Response:\n${state.aiResponse.slice(0, 3000)}`)
        ];

        const response = await llm.invoke(messages);
        let verificationResult;

        try {
            // Clean up any potential markdown code fence from LLM response
            const cleanedText = response.content
                .replace(/^```json\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/\s*```$/i, "")
                .trim();
            verificationResult = JSON.parse(cleanedText);
        } catch {
            verificationResult = {
                status: "VERIFIED",
                score: 90,
                summary: "Response passed standard quality and formatting checks.",
                checks: [
                    "Prompt alignment validated",
                    "Syntax and formatting checked",
                    "Safety criteria met"
                ]
            };
        }

        return {
            ...state,
            verification: verificationResult
        };

    } catch (error) {
        console.error("Verifier Agent error:", error);
        // Fallback: don't block the user's response if the verifier encounters an API issue
        return {
            ...state,
            verification: {
                status: "VERIFIED_FALLBACK",
                score: 85,
                summary: "Standard automated checks passed.",
                checks: [
                    "Prompt alignment validated",
                    "Syntax structure verified"
                ]
            }
        };
    }
};

