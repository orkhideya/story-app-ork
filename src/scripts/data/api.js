import CONFIG from "../config";

const API_ENDPOINT = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  GET_STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  DETAIL_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

class StoryAPI {
  static async register({ name, email, password }) {
    try {
      const response = await fetch(API_ENDPOINT.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.error("Registration error:", error);
      return { error: true, message: error.message };
    }
  }

  static async login({ email, password }) {
    try {
      const response = await fetch(API_ENDPOINT.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.error("Login error:", error);
      return { error: true, message: error.message };
    }
  }

  static async getStories(token, { page, size } = { page: 1, size: 10 }) {
    try {
      const url = new URL(API_ENDPOINT.GET_STORIES);
      url.searchParams.append("page", page);
      url.searchParams.append("size", size);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.error("Get stories error:", error);
      return { error: true, message: error.message };
    }
  }

  static async addStory({ description, photo, lat, lon }, token) {
    try {
      // Log input parameters for debugging
      console.log("API.addStory - Input parameters:");
      console.log("- description:", description);
      console.log(
        "- photo:",
        photo
          ? {
              name: photo.name,
              type: photo.type,
              size: photo.size,
            }
          : "null"
      );
      console.log(
        "- location:",
        lat !== undefined && lon !== undefined ? `${lat}, ${lon}` : "none"
      );
      console.log("- token exists:", !!token);

      // Validasi input sebelum membuat FormData
      if (!description || !photo || !(photo instanceof File)) {
        console.error("Invalid input parameters");
        return {
          error: true,
          message: !photo
            ? "Foto tidak ditemukan"
            : !(photo instanceof File)
            ? "Format foto tidak valid"
            : "Data tidak lengkap",
        };
      }

      const formData = new FormData();
      formData.append("description", description);
      formData.append("photo", photo);

      if (lat !== undefined && lon !== undefined) {
        formData.append("lat", lat.toString());
        formData.append("lon", lon.toString());
      }

      // Debug formData entries
      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(
          `- ${key}: ${
            value instanceof File
              ? `File: ${value.name} (${value.type}, ${value.size} bytes)`
              : value
          }`
        );
      }

      // Lakukan request dengan timeout yang lebih lama
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(API_ENDPOINT.ADD_STORY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // JANGAN tambahkan Content-Type di sini, biarkan browser yang menangani untuk FormData
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Debug response
      console.log("API Response status:", response.status);

      const responseJson = await response.json();
      console.log("API Response data:", responseJson);

      return responseJson;
    } catch (error) {
      console.error("Add story error:", error);
      return { error: true, message: error.message };
    }
  }

  static async getStoryById(id, token) {
    try {
      const response = await fetch(API_ENDPOINT.DETAIL_STORY(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.error("Get story detail error:", error);
      return { error: true, message: error.message };
    }
  }
}

export default StoryAPI;
