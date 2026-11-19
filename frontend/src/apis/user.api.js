import api from "../utils/axios";

export const getCurrentUser = async () => {
    try {
        const response = await api.get("/api/me");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch current user:", error.response?.data || error.message);
        return null;
    }
};

export const useCoins = async (data) => {
    try {
        const response = await api.post("/api/auth/use-coins", data);
        return response.data;
    } catch (error) {
        console.error("Failed to use coins:", error.response?.data || error.message);
        throw error;
    }
};