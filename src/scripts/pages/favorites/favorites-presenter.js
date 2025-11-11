import IDBHelper from "../../utils/idb-helper";
import Swal from "sweetalert2";

class FavoritesPresenter {
  #view = null;

  constructor(view) {
    this.#view = view;
  }

  async getFavorites() {
    try {
      const stories = await IDBHelper.getAllFavoriteStories();
      
      // Sort by createdAt descending (newest first)
      stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return stories;
    } catch (error) {
      console.error("Error loading favorites:", error);
      await Swal.fire({
        icon: "error",
        title: "Gagal Memuat Favorit",
        text: error.message,
      });
      return [];
    }
  }

  async removeFavorite(storyId) {
    try {
      const result = await Swal.fire({
        title: "Hapus dari Favorit?",
        text: "Cerita ini akan dihapus dari daftar favorit Anda",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        await IDBHelper.deleteFavoriteStory(storyId);
        
        await Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Cerita telah dihapus dari favorit",
          timer: 1500,
          showConfirmButton: false,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error removing favorite:", error);
      await Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: error.message,
      });
      return false;
    }
  }
}

export default FavoritesPresenter;