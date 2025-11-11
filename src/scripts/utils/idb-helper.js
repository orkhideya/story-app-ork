import { openDB } from "idb";
import CONFIG from "../config";

class IDBHelper {
  static #dbPromise = null;

  static async #getDB() {
    if (!this.#dbPromise) {
      this.#dbPromise = openDB(CONFIG.DATABASE_NAME, CONFIG.DATABASE_VERSION, {
        upgrade(database) {
          // Membuat object store untuk stories favorit
          if (!database.objectStoreNames.contains(CONFIG.OBJECT_STORE_NAME)) {
            const storyObjectStore = database.createObjectStore(
              CONFIG.OBJECT_STORE_NAME,
              {
                keyPath: "id",
              }
            );
            
            // Membuat index untuk pencarian berdasarkan createdAt
            storyObjectStore.createIndex("createdAt", "createdAt", {
              unique: false,
            });
          }
        },
      });
    }
    return this.#dbPromise;
  }

  // CREATE: Menambahkan story ke favorit
  static async addFavoriteStory(story) {
    try {
      const db = await this.#getDB();
      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
      
      await store.add(story);
      await tx.done;
      
      console.log("Story added to favorites:", story.id);
      return { success: true };
    } catch (error) {
      console.error("Error adding story to favorites:", error);
      throw new Error("Gagal menambahkan ke favorit");
    }
  }

  // READ: Mendapatkan semua stories favorit
  static async getAllFavoriteStories() {
    try {
      const db = await this.#getDB();
      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, "readonly");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
      
      const stories = await store.getAll();
      await tx.done;
      
      console.log("Retrieved favorite stories:", stories.length);
      return stories;
    } catch (error) {
      console.error("Error getting favorite stories:", error);
      return [];
    }
  }

  // READ: Mendapatkan story favorit berdasarkan ID
  static async getFavoriteStoryById(id) {
    try {
      const db = await this.#getDB();
      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, "readonly");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
      
      const story = await store.get(id);
      await tx.done;
      
      return story;
    } catch (error) {
      console.error("Error getting favorite story:", error);
      return null;
    }
  }

  // DELETE: Menghapus story dari favorit
  static async deleteFavoriteStory(id) {
    try {
      const db = await this.#getDB();
      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
      
      await store.delete(id);
      await tx.done;
      
      console.log("Story removed from favorites:", id);
      return { success: true };
    } catch (error) {
      console.error("Error deleting favorite story:", error);
      throw new Error("Gagal menghapus dari favorit");
    }
  }

  // CHECK: Mengecek apakah story sudah ada di favorit
  static async isFavorite(id) {
    try {
      const story = await this.getFavoriteStoryById(id);
      return !!story;
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  }

  // UTILITY: Menghitung jumlah favorit
  static async getFavoriteCount() {
    try {
      const db = await this.#getDB();
      const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, "readonly");
      const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
      
      const count = await store.count();
      await tx.done;
      
      return count;
    } catch (error) {
      console.error("Error getting favorite count:", error);
      return 0;
    }
  }
}

export default IDBHelper;