import { ChatGroq } from "@langchain/groq"
const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0.2,
    maxRetries: 2,
    maxTokens: 4000,
    apiKey: process.env.GROQ_API_KEY
})

export default llm