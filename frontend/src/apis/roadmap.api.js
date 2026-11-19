
import api from "../utils/axios";

// Generate a new roadmap
export const generateRoadmap = async (data) => {
  try {
    const response = await api.post(
      "/api/roadmap/generate",
      data
    );

    return response.data;
  } catch (error) {
    console.error("Generate roadmap API error:", error);
    throw error;
  }
};


// Get all roadmaps of the logged-in user
export const getAllRoadmaps = async () => {
  try {
    const response = await api.get("/api/roadmap/all");

    return response.data;
  } catch (error) {
    console.error("Get all roadmaps API error:", error);
    throw error;
  }
};


// Get a particular roadmap by ID
export const getRoadmap = async (id) => {
  try {
    const response = await api.get(`/api/roadmap/${id}`);

    return response.data;
  } catch (error) {
    console.error("Get roadmap by ID API error:", error);
    throw error;
  }
};
