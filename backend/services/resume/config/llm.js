
import "dotenv/config";
import { ChatGroq } from "@langchain/groq"


console.log("Groq key loaded:", Boolean(process.env.GROQ_API_KEY));
const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0.2,
    maxTokens: 2500,
    maxRetries: 2,
    // other params...
})

export default llm 