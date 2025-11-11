import StoryAPI from "../../data/api";
import Swal from "sweetalert2";

class AddStoryPresenter {
  #view = null;
  #stream = null;
  #selectedLocation = null;

  constructor(view) {
    this.#view = view;
  }

  async addStory(description, photo) {
    try {
      console.log("AddStoryPresenter.addStory - description:", description);
      console.log("AddStoryPresenter.addStory - photo:", photo);
      console.log(
        "AddStoryPresenter.addStory - location:",
        this.#selectedLocation
      );

      if (!this._validateAllFields(description, photo)) {
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found");
      }

      if (!(photo instanceof File)) {
        console.error("Photo is not a File object:", photo);
        throw new Error("Format foto tidak valid");
      }

      const data = {
        description,
        photo,
      };

      if (this.#selectedLocation) {
        data.lat = this.#selectedLocation.lat;
        data.lon = this.#selectedLocation.lng;
      }

      console.log("Sending story data to API:", {
        description: data.description,
        photoName: data.photo.name,
        photoSize: data.photo.size,
        photoType: data.photo.type,
        location: this.#selectedLocation ? `${data.lat}, ${data.lon}` : "none",
      });

      const response = await StoryAPI.addStory(data, token);
      console.log("API response:", response);

      if (response.error) {
        throw new Error(response.message);
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Cerita berhasil ditambahkan",
        timer: 1500,
        showConfirmButton: false,
      });

      window.location.hash = "#/stories";
    } catch (error) {
      console.error("Error in addStory:", error);
      await Swal.fire({
        icon: "error",
        title: "Gagal Menambahkan Cerita",
        text: error.message,
      });

      if (error.message === "Token not found") {
        window.location.hash = "#/login";
      }
    }
  }

  _validateAllFields(description, photo) {
    console.log("Validating fields - description:", !!description);
    console.log("Validating fields - photo:", !!photo);
    console.log("Validating fields - location:", !!this.#selectedLocation);

    const missingFields = [];

    if (!description || description.trim().length === 0) {
      missingFields.push("cerita");
    }

    if (!photo) {
      missingFields.push("foto");
    } else if (!(photo instanceof File)) {
      console.error("Photo is not a File object:", photo);
      missingFields.push("foto (format tidak valid)");
    }

    if (!this.#selectedLocation) {
      missingFields.push("lokasi");
    }

    if (missingFields.length > 0) {
      console.warn("Missing fields:", missingFields);
      Swal.fire({
        icon: "warning",
        title: "Data Belum Lengkap",
        text: `Mohon lengkapi ${missingFields.join(", ")} Anda`,
      });
      return false;
    }

    return true;
  }

  async startCamera() {
    try {
      console.log("Starting camera...");

      //stop any existing stream first
      await this.stopCamera();
      this.#stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      console.log("Camera started successfully:", this.#stream);
      return this.#stream;
    } catch (error) {
      console.error("Error starting camera:", error);
      throw new Error("Tidak dapat mengakses kamera");
    }
  }

  async stopCamera() {
    if (this.#stream) {
      console.log("Stopping camera...");

      //stop all tracks in the stream
      const tracks = this.#stream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });

      this.#stream = null;
      console.log("Camera stopped");
      return true;
    }
    return false;
  }

  validateImage(file) {
    console.log("Validating image:", file);

    //check if it is a file
    if (!(file instanceof File)) {
      throw new Error("File tidak valid");
    }

    //check file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File harus berupa gambar");
    }

    //max 1MB file upload
    if (file.size > 1024 * 1024) {
      throw new Error("Ukuran file tidak boleh lebih dari 1MB");
    }

    console.log("Image validation passed");
    return true;
  }

  setSelectedLocation(location) {
    console.log("Location selected:", location);
    this.#selectedLocation = location;
  }

  getSelectedLocation() {
    return this.#selectedLocation;
  }
}

export default AddStoryPresenter;
