
import "dotenv/config";
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("REDIS_URL is required");
}

const client = createClient({ url: redisUrl });

client.on("error", (err) => {
    console.error("Redis Client Error:", err);
});

await client.connect();

console.log("Redis Connected Successfully!");

export default client;
