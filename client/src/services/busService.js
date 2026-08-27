import axios from "axios";

const API_URL = "http://localhost:5000/api/buses";

// Fetch all bus services
export const fetchAllBuses = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching buses from API:", error);
    throw error;
  }
};

// Add a new bus service (Admin)
export const createBusService = async (busData) => {
  try {
    const response = await axios.post(API_URL, busData);
    return response.data;
  } catch (error) {
    console.error("Error creating bus service:", error);
    throw error;
  }
};

// Update an existing bus service (Admin)
export const updateBusService = async (id, busData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, busData);
    return response.data;
  } catch (error) {
    console.error("Error updating bus service:", error);
    throw error;
  }
};

// Delete a bus service (Admin)
export const deleteBusService = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting bus service:", error);
    throw error;
  }
};
