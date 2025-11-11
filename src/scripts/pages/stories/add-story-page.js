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
        <h1 id="main-content" class="add-story__title">
          <i class="fas fa-plus-circle"></i> Tambah Cerita
        </h1>
        
        <form id="addStoryForm" class="add-story__form">
          <!-- Location Section -->
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

          <!-- Description Section -->
          <div class="form-group">
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
          
          <!-- Photo Upload Section -->
          <div class="form-group">
            <label>
              <i class="fas fa-camera"></i> Foto <span class="required">*</span>
            </label>
            
            <div class="photo-upload-container">
              <!-- Camera Section -->
              <div class="upload-method">
                <div class="method-header">
                  <i class="fas fa-camera"></i>
                  <span>Ambil Foto Langsung</span>
                </div>
                
                <div class="camera-wrapper">
                  <video id="cameraPreview" class="camera-preview" autoplay playsinline style="display: none;"></video>
                  <canvas id="photoCanvas" class="photo-canvas" style="display: none;"></canvas>
                </div>
                
                <div class="camera-controls">
                  <button type="button" id="startCamera" class="btn-camera">
                    <i class="fas fa-video"></i> Buka Kamera
                  </button>
                  <button type="button" id="capturePhoto" class="btn-camera btn-primary" style="display: none;">
                    <i class="fas fa-camera"></i> Ambil Foto
                  </button>
                  <button type="button" id="closeCamera" class="btn-camera btn-secondary" style="display: none;">
                    <i class="fas fa-times"></i> Tutup
                  </button>
                  <button type="button" id="retakePhoto" class="btn-camera btn-secondary" style="display: none;">
                    <i class="fas fa-redo"></i> Ambil Ulang
                  </button>
                </div>
              </div>

              <!-- Divider -->
              <div class="upload-divider">
                <span>atau</span>
              </div>

              <!-- File Upload Section -->
              <div class="upload-method">
                <div class="method-header">
                  <i class="fas fa-folder-open"></i>
                  <span>Pilih dari File</span>
                </div>
                
                <div class="file-upload-area">
                  <input 
                    type="file" 
                    id="photo" 
                    name="photo" 
                    accept="image/*" 
                    class="file-input"
                    aria-label="Pilih file foto"
                  >
                  <label for="photo" class="file-upload-label">
                    <div class="upload-icon">
                      <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div class="upload-text">
                      <strong>Klik untuk memilih foto</strong>
                      <span>atau drag & drop di sini</span>
                    </div>
                  </label>
                </div>
                
                <p class="file-requirements">
                  <i class="fas fa-info-circle"></i> 
                  Format: JPG, PNG, GIF • Maksimal 1MB
                </p>
              </div>

              <!-- Photo Preview -->
              <div id="imagePreview" class="photo-preview-section" style="display: none;">
                <div class="preview-header">
                  <span><i class="fas fa-check-circle"></i> Foto berhasil dipilih</span>
                  <button type="button" id="removeImage" class="btn-remove">
                    <i class="fas fa-trash-alt"></i> Hapus
                  </button>
                </div>
                <div class="preview-image-wrapper">
                  <img id="previewImage" class="preview-image" alt="Preview foto">
                </div>
                <p class="preview-info" id="photoInfo"></p>
              </div>

              <!-- Status -->
              <small id="photoStatus" class="form-help"></small>
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

  //helper function for format file size
  #formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  async afterRender() {
    // DOM Elements
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
    const photoInfo = document.getElementById("photoInfo");
    const mapContainer = document.getElementById("map");
    const coordinateDisplay = document.getElementById("coordinateDisplay");
    const latitudeValue = document.getElementById("latitudeValue");
    const longitudeValue = document.getElementById("longitudeValue");
    const descriptionStatus = document.getElementById("descriptionStatus");
    const photoStatus = document.getElementById("photoStatus");
    const locationStatus = document.getElementById("locationStatus");

    let photoFile = null;

    //initialize map
    this.#map = MapHelper.initMap(mapContainer, true);

    //update status indicators
    const updateStatusIndicators = () => {
      const description = document.getElementById("description").value;

      //description status
      if (!description || description.trim().length === 0) {
        descriptionStatus.textContent = "Cerita belum diisi";
        descriptionStatus.className = "form-help text-warning";
      } else {
        descriptionStatus.textContent = "Cerita telah diisi";
        descriptionStatus.className = "form-help text-success";
      }

      //photo status
      if (!photoFile) {
        photoStatus.textContent = "Foto belum dipilih";
        photoStatus.className = "form-help text-warning";
      } else {
        photoStatus.textContent = "Foto telah dipilih";
        photoStatus.className = "form-help text-success";
      }

      //location status
      if (!this.#presenter.getSelectedLocation()) {
        locationStatus.textContent = "Lokasi belum dipilih";
        locationStatus.className = "form-help text-warning";
      } else {
        locationStatus.textContent = "Lokasi telah dipilih";
        locationStatus.className = "form-help text-success";
      }
    };

    //initial status check
    updateStatusIndicators();

    //description input handler
    document
      .getElementById("description")
      .addEventListener("input", updateStatusIndicators);

    //camera handlers
    startCameraBtn.addEventListener("click", async () => {
      try {
        const stream = await this.#presenter.startCamera();
        if (!stream) {
          throw new Error("Tidak dapat mendapatkan akses kamera");
        }
        cameraPreview.srcObject = stream;
        await cameraPreview.play();

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
      await this.#presenter.stopCamera();
      cameraPreview.srcObject = null;
      cameraPreview.style.display = "none";
      closeCameraBtn.style.display = "none";
      capturePhotoBtn.style.display = "none";
      startCameraBtn.style.display = "block";
    });

    capturePhotoBtn.addEventListener("click", async () => {
      try {
        if (!cameraPreview.srcObject || !cameraPreview.videoWidth) {
          throw new Error("Kamera belum siap. Coba lagi.");
        }

        photoCanvas.width = cameraPreview.videoWidth;
        photoCanvas.height = cameraPreview.videoHeight;

        const context = photoCanvas.getContext("2d");
        context.drawImage(
          cameraPreview,
          0,
          0,
          photoCanvas.width,
          photoCanvas.height
        );

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
              resolve(file);
            },
            "image/jpeg",
            0.9
          );
        });

        if (!photoFile || photoFile.size === 0) {
          throw new Error("Gagal mengambil foto dari kamera");
        }

        this.#presenter.validateImage(photoFile);

        // Show preview
        previewImage.src = URL.createObjectURL(photoFile);
        imagePreview.style.display = "block";

        // Show file info
        photoInfo.textContent = `camera-photo.jpg • ${this.#formatFileSize(
          photoFile.size
        )}`;

        // Update UI
        cameraPreview.style.display = "none";
        photoCanvas.style.display = "block";
        capturePhotoBtn.style.display = "none";
        closeCameraBtn.style.display = "none";
        retakePhotoBtn.style.display = "block";

        await this.#presenter.stopCamera();
        updateStatusIndicators();
      } catch (error) {
        console.error("Error capturing photo:", error);
        alert(`Gagal mengambil foto: ${error.message}`);
      }
    });

    retakePhotoBtn.addEventListener("click", async () => {
      try {
        const stream = await this.#presenter.startCamera();
        cameraPreview.srcObject = stream;
        await cameraPreview.play();

        cameraPreview.style.display = "block";
        photoCanvas.style.display = "none";
        capturePhotoBtn.style.display = "block";
        closeCameraBtn.style.display = "block";
        retakePhotoBtn.style.display = "none";
        imagePreview.style.display = "none";
        photoFile = null;

        updateStatusIndicators();
      } catch (error) {
        console.error("Failed to restart camera:", error);
        alert(
          "Gagal mengakses kamera. Pastikan Anda memberikan izin untuk menggunakan kamera."
        );
      }
    });

    //file upload handler
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        this.#presenter.validateImage(file);
        photoFile = file;

        //show preview
        previewImage.src = URL.createObjectURL(file);
        imagePreview.style.display = "block";

        //show file info
        photoInfo.textContent = `${file.name} • ${this.#formatFileSize(
          file.size
        )}`;

        //stop camera if running
        await this.#presenter.stopCamera();
        cameraPreview.style.display = "none";
        photoCanvas.style.display = "none";
        startCameraBtn.style.display = "block";
        capturePhotoBtn.style.display = "none";
        closeCameraBtn.style.display = "none";
        retakePhotoBtn.style.display = "none";

        updateStatusIndicators();
      } catch (error) {
        alert(error.message);
        fileInput.value = "";
      }
    });

    //remove image handler
    removeImageBtn.addEventListener("click", () => {
      photoFile = null;
      fileInput.value = "";
      imagePreview.style.display = "none";
      updateStatusIndicators();
    });

    //map location selection handler
    mapContainer.addEventListener("locationselected", (e) => {
      const { lat, lng } = e.detail;
      latitudeValue.textContent = lat.toFixed(6);
      longitudeValue.textContent = lng.toFixed(6);
      coordinateDisplay.style.display = "block";
      this.#presenter.setSelectedLocation(e.detail);
      updateStatusIndicators();
    });

    //form submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

      try {
        const description = document.getElementById("description").value;
        await this.#presenter.addStory(description, photoFile);
      } catch (error) {
        console.error("Form submission error:", error);
        alert(`Gagal mengirim cerita: ${error.message}`);
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML =
          '<i class="fas fa-paper-plane"></i> Tambah Cerita';
      }
    });
  }

  async destroy() {
    if (this.#map) {
      this.#map.remove();
      this.#map = null;
    }
    await this.#presenter.stopCamera();
  }
}

export default AddStoryPage;
