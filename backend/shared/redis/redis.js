
import { createClient } from "redis";

const client = createClient({
    username: "default",
    password: "AmpJUpCEoumuHNoWntW3kLWlsglpOjeA",
    socket: {
        host: "stunning-cast-ship-79371.db.redis.io",
        port: 14377
    }
});

client.on("error", (err) => {
    console.error("Redis Client Error:", err);
});

await client.connect();

console.log("Redis Connected Successfully!");

export default client;
