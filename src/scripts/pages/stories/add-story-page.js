import AddStoryPresenter from "./add-story-presenter";
import MapHelper from "../../utils/map-helper";

class AddStoryPage {
  #presenter = null;
  #map = null;

  constructor() {
    this.#presenter = new AddStoryPresenter(this);
  }

  async render() {
    return `      
      <section class="add-story container">
        <h1 id="main-content" class="add-story__title"><i class="fas fa-plus-circle"></i>Tambah Cerita</h1>
        
        <form id="addStoryForm" class="add-story__form">
          <div class="form-group">

          <div class="form-group">
            <label>
              <i class="fas fa-map-marker-alt"></i> Lokasi <span class="required">*</span>
            </label>
            <div id="map" class="add-story__map"></div>
            <p class="map-help">
              <i class="fas fa-info-circle"></i> Klik pada peta untuk menandai lokasi
            </p>
            <div id="coordinateDisplay" class="coordinate-display" style="display: none;">
              <i class="fas fa-map-pin"></i> 
              Latitude: <span id="latitudeValue">-</span>, 
              Longitude: <span id="longitudeValue">-</span>
            </div>
            <small id="locationStatus" class="form-help"></small>
          </div>

            <label for="description">
              <i class="fas fa-pencil-alt"></i> Cerita Anda <span class="required">*</span>
            </label>
            <textarea 
              id="description" 
              name="description" 
              required 
              placeholder="Ceritakan momen spesial Anda..."
            ></textarea>
            <small id="descriptionStatus" class="form-help"></small>
          </div>

          <div class="form-group">
            <label>
              <i class="fas fa-camera"></i> Foto <span class="required">*</span>
            </label>
            <div class="photo-input-container">
              <div class="camera-container">
                <video id="cameraPreview" class="camera-preview" autoplay playsinline style="display: none;"></video>
                <canvas id="photoCanvas" class="photo-canvas" style="display: none;"></canvas>
              </div>
              
              <div class="camera-buttons">
                <button type="button" id="startCamera" class="camera-button">
                  <i class="fas fa-camera"></i> Buka Kamera
                </button>
                <button type="button" id="closeCamera" class="camera-button camera-button--danger" style="display: none;">
                  <i class="fas fa-times"></i> Tutup Kamera
                </button>
                <button type="button" id="capturePhoto" class="camera-button" style="display: none;">
                  <i class="fas fa-camera"></i> Ambil Foto
                </button>
                <button type="button" id="retakePhoto" class="camera-button" style="display: none;">
                  <i class="fas fa-redo"></i> Ambil Ulang
                </button>
              </div>
              
              <div class="upload-divider">atau</div>
              
              <div class="upload-container">
                <div class="file-input-wrapper">
                  <label for="photo" class="upload-button">
                    <i class="fas fa-upload"></i> Pilih File
                  </label>
                  <input 
                    type="file" 
                    id="photo" 
                    name="photo" 
                    accept="image/*" 
                    class="file-input"
                  >
                </div>
                <p class="file-help">Format: JPG, PNG, GIF (max. 1MB)</p>
                <small id="photoStatus" class="form-help"></small>
                
                <div id="imagePreview" class="image-preview" style="display: none;">
                  <img id="previewImage" class="preview-image">
                  <button type="button" id="removeImage" class="camera-button camera-button--danger">&times;</button>
                </div>
              </div>
            </div>
          </div>
          
          <button type="submit" class="submit-button">
            <i class="fas fa-paper-plane"></i> Tambah Cerita
          </button>

          <p class="required-note">
            <span class="required">*</span> Wajib diisi
          </p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById("addStoryForm");
    const cameraPreview = document.getElementById("cameraPreview");
    const photoCanvas = document.getElementById("photoCanvas");
    const startCameraBtn = document.getElementById("startCamera");
    const closeCameraBtn = document.getElementById("closeCamera");
    const capturePhotoBtn = document.getElementById("capturePhoto");
    const retakePhotoBtn = document.getElementById("retakePhoto");
    const fileInput = document.getElementById("photo");
    const imagePreview = document.getElementById("imagePreview");
    const previewImage = document.getElementById("previewImage");
    const removeImageBtn = document.getElementById("removeImage");
    const mapContainer = document.getElementById("map");

    // Coordinate display elements
    const coordinateDisplay = document.getElementById("coordinateDisplay");
    const latitudeValue = document.getElementById("latitudeValue");
    const longitudeValue = document.getElementById("longitudeValue");

    // Status elements
    const descriptionStatus = document.getElementById("descriptionStatus");
    const photoStatus = document.getElementById("photoStatus");
    const locationStatus = document.getElementById("locationStatus");

    let photoFile = null;

    // Log DOM elements for debugging
    console.log("DOM Elements:");
    console.log("- form:", !!form);
    console.log("- cameraPreview:", !!cameraPreview);
    console.log("- photoCanvas:", !!photoCanvas);
    console.log("- fileInput:", !!fileInput);
    console.log("- mapContainer:", !!mapContainer);
    console.log("- coordinateDisplay:", !!coordinateDisplay);

    // Initialize map with interactive mode enabled
    this.#map = MapHelper.initMap(mapContainer, true);

    // Update status indicators
    const updateStatusIndicators = () => {
      const description = document.getElementById("description").value;

      // Description status
      if (!description || description.trim().length === 0) {
        descriptionStatus.textContent = "Cerita belum diisi";
        descriptionStatus.className = "form-help text-warning";
      } else {
        descriptionStatus.textContent = "✓ Cerita telah diisi";
        descriptionStatus.className = "form-help text-success";
      }

      // Photo status
      if (!photoFile) {
        photoStatus.textContent = "Foto belum dipilih";
        photoStatus.className = "form-help text-warning";
      } else {
        photoStatus.textContent = "✓ Foto telah dipilih";
        photoStatus.className = "form-help text-success";
      }

      // Location status
      if (!this.#presenter.getSelectedLocation()) {
        locationStatus.textContent = "Lokasi belum dipilih";
        locationStatus.className = "form-help text-warning";
      } else {
        locationStatus.textContent = "✓ Lokasi telah dipilih";
        locationStatus.className = "form-help text-success";
      }
    };

    // Initial status check
    updateStatusIndicators();

    // Description input handler
    document
      .getElementById("description")
      .addEventListener("input", updateStatusIndicators);

    // Camera handling
    startCameraBtn.addEventListener("click", async () => {
      try {
        console.log("Starting camera...");
        const stream = await this.#presenter.startCamera();
        console.log("Camera stream obtained:", stream);

        if (!stream) {
          throw new Error("Tidak dapat mendapatkan akses kamera");
        }

        cameraPreview.srcObject = stream;
        await cameraPreview.play();

        console.log("Camera preview dimensions:", {
          width: cameraPreview.videoWidth,
          height: cameraPreview.videoHeight,
        });

        cameraPreview.style.display = "block";
        startCameraBtn.style.display = "none";
        closeCameraBtn.style.display = "block";
        capturePhotoBtn.style.display = "block";
      } catch (error) {
        console.error("Failed to start camera:", error);
        alert(
          "Gagal mengakses kamera. Pastikan Anda memberikan izin untuk menggunakan kamera."
        );
      }
    });

    closeCameraBtn.addEventListener("click", async () => {
      console.log("Closing camera...");
      await this.#presenter.stopCamera();
      cameraPreview.srcObject = null;
      cameraPreview.style.display = "none";
      closeCameraBtn.style.display = "none";
      capturePhotoBtn.style.display = "none";
      startCameraBtn.style.display = "block";
    });

    capturePhotoBtn.addEventListener("click", async () => {
      console.log("Capturing photo...");

      try {
        // Video stream validation
        if (!cameraPreview.srcObject || !cameraPreview.videoWidth) {
          console.error("Video stream not ready");
          throw new Error("Kamera belum siap. Coba lagi.");
        }

        // Set canvas dimensions to match video
        photoCanvas.width = cameraPreview.videoWidth;
        photoCanvas.height = cameraPreview.videoHeight;

        console.log("Canvas dimensions set to:", {
          width: photoCanvas.width,
          height: photoCanvas.height,
        });

        // Draw video frame to canvas
        const context = photoCanvas.getContext("2d");
        context.drawImage(
          cameraPreview,
          0,
          0,
          photoCanvas.width,
          photoCanvas.height
        );

        console.log("Video frame drawn to canvas");

        // Convert canvas to file using Promise for better error handling
        photoFile = await new Promise((resolve, reject) => {
          photoCanvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Gagal mengambil foto dari kamera"));
                return;
              }

              const file = new File([blob], "camera-photo.jpg", {
                type: "image/jpeg",
                lastModified: Date.now(),
              });

              console.log("Photo blob created:", {
                size: blob.size,
                type: blob.type,
              });
              console.log("Photo file created:", {
                name: file.name,
                size: file.size,
                type: file.type,
              });

              resolve(file);
            },
            "image/jpeg",
            0.9
          ); // 90% quality
        });

        // Validation of photo results
        if (!photoFile || photoFile.size === 0) {
          throw new Error("Gagal mengambil foto dari kamera");
        }

        // File size validation
        this.#presenter.validateImage(photoFile);

        // Show preview
        previewImage.src = URL.createObjectURL(photoFile);
        imagePreview.style.display = "inline-block";

        // Update UI
        cameraPreview.style.display = "none";
        photoCanvas.style.display = "block";
        capturePhotoBtn.style.display = "none";
        closeCameraBtn.style.display = "none";
        retakePhotoBtn.style.display = "block";

        // Stop the camera since we have our photo
        await this.#presenter.stopCamera();

        // Update status
        updateStatusIndicators();

        console.log("Photo capture completed successfully");
      } catch (error) {
        console.error("Error capturing photo:", error);
        alert(`Gagal mengambil foto: ${error.message}`);
      }
    });

    retakePhotoBtn.addEventListener("click", async () => {
      try {
        console.log("Retaking photo...");
        // Start camera again for retaking photo
        const stream = await this.#presenter.startCamera();
        cameraPreview.srcObject = stream;
        await cameraPreview.play();

        // Reset UI for new capture
        cameraPreview.style.display = "block";
        photoCanvas.style.display = "none";
        capturePhotoBtn.style.display = "block";
        closeCameraBtn.style.display = "block";
        retakePhotoBtn.style.display = "none";
        imagePreview.style.display = "none";
        photoFile = null;

        // Update status
        updateStatusIndicators();
      } catch (error) {
        console.error("Failed to restart camera:", error);
        alert(
          "Gagal mengakses kamera. Pastikan Anda memberikan izin untuk menggunakan kamera."
        );
      }
    });

    // File upload handling
    fileInput.addEventListener("change", async (e) => {
      console.log("File input changed");
      const file = e.target.files[0];
      if (!file) {
        console.log("No file selected");
        return;
      }

      try {
        console.log("Selected file:", {
          name: file.name,
          size: file.size,
          type: file.type,
        });

        // File validation
        this.#presenter.validateImage(file);

        photoFile = file;
        previewImage.src = URL.createObjectURL(file);
        imagePreview.style.display = "inline-block";

        // Stop camera if it's running
        await this.#presenter.stopCamera();
        cameraPreview.style.display = "none";
        photoCanvas.style.display = "none";
        startCameraBtn.style.display = "block";
        capturePhotoBtn.style.display = "none";
        closeCameraBtn.style.display = "none";
        retakePhotoBtn.style.display = "none";

        // Update status
        updateStatusIndicators();

        console.log("File selected successfully");
      } catch (error) {
        console.error("File validation error:", error);
        alert(error.message);
        fileInput.value = "";
      }
    });

    removeImageBtn.addEventListener("click", () => {
      console.log("Removing image...");

      photoFile = null;
      fileInput.value = "";
      imagePreview.style.display = "none";
      updateStatusIndicators();

      console.log("Image removed");
    });

    // Map location selection handler
    mapContainer.addEventListener("locationselected", (e) => {
      console.log("Location selected:", e.detail);

      // Display coordinates when location is selected
      const { lat, lng } = e.detail;
      latitudeValue.textContent = lat.toFixed(6);
      longitudeValue.textContent = lng.toFixed(6);
      coordinateDisplay.style.display = "block";

      this.#presenter.setSelectedLocation(e.detail);
      updateStatusIndicators();
    });

    // Form submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Form submitted");

      // Disable form elements during submission
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

      try {
        const description = document.getElementById("description").value;

        console.log("Submitting story:");
        console.log("- description:", description);
        console.log(
          "- photo:",
          photoFile
            ? {
                name: photoFile.name,
                size: photoFile.size,
                type: photoFile.type,
              }
            : "null"
        );

        await this.#presenter.addStory(description, photoFile);
      } catch (error) {
        console.error("Form submission error:", error);
        alert(`Gagal mengirim cerita: ${error.message}`);
      } finally {
        // Re-enable form elements
        submitButton.disabled = false;
        submitButton.innerHTML =
          '<i class="fas fa-paper-plane"></i> Tambah Cerita';
      }
    });
  }

  async destroy() {
    console.log("Destroying AddStoryPage component");

    // Clean up map
    if (this.#map) {
      this.#map.remove();
      this.#map = null;
    }

    // Ensure camera is stopped when navigating away
    await this.#presenter.stopCamera();

    console.log("AddStoryPage destroyed");
  }
}

export default AddStoryPage;
