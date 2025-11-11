import DetailStoryPresenter from "./detail-story-presenter";
import { showFormattedDate } from "../../utils";
import IDBHelper from "../../utils/idb-helper";
import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

class DetailStoryPage {
  #presenter = null;
  #currentStory = null;
  #defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  constructor() {
    this.#presenter = new DetailStoryPresenter(this);
  }

  async render() {
    return `
      <!-- Skip to content link -->
      <a href="#main-content" class="skip-to-content">Lewati ke konten utama</a>
      
      <section class="detail-story container">
        <a href="#/stories" class="back-button">&laquo; Kembali ke Daftar Cerita</a>
        <div id="storyContent" class="detail-story__content">
          <div id="main-content" class="loading" tabindex="-1">Memuat...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const url = window.location.hash.slice(1);
    const storyId = url.split("/")[2];
    const contentContainer = document.getElementById("storyContent");

    try {
      const story = await this.#presenter.getStoryDetail(storyId);
      this.#currentStory = story;

      const isFavorite = await IDBHelper.isFavorite(storyId);
      const favoriteClass = isFavorite ? "active" : "";
      const favoriteIcon = isFavorite ? "fas fa-heart" : "far fa-heart";
      const favoriteText = isFavorite ? "Hapus dari Favorit" : "Tambahkan ke Favorit";

      contentContainer.innerHTML = `
        <div class="detail-story__header">
          <h1 id="main-content" class="detail-story__title" tabindex="-1">${
            story.name
          }</h1>
          <button id="favoriteBtn" class="detail-favorite-btn ${favoriteClass}" title="${favoriteText}">
            <i class="${favoriteIcon}"></i> ${favoriteText}
          </button>
        </div>
        <p class="detail-story__date">${showFormattedDate(story.createdAt)}</p>
       
        <img
          src="${story.photoUrl}"
          alt="Foto dari ${story.name}"
          class="detail-story__image"
        >
       
        <p class="detail-story__description">${story.description}</p>
       
        ${
          story.lat && story.lon
            ? `
          <div class="detail-story__map-container">
            <h2>Lokasi</h2>
            <div class="detail-story__coordinates">
              <i class="fas fa-map-pin"></i>
              Latitude: <span class="coordinate-value">${story.lat.toFixed(
                6
              )}</span>,
              Longitude: <span class="coordinate-value">${story.lon.toFixed(
                6
              )}</span>
            </div>
            <div id="map" class="detail-story__map"></div>
          </div>
        `
            : ""
        }
      `;

      // Setup favorite button
      const favoriteBtn = document.getElementById("favoriteBtn");
      favoriteBtn.addEventListener("click", async () => {
        await this._toggleFavorite(storyId, story);
      });

      if (story.lat && story.lon) {
        const mapContainer = document.getElementById("map");
        this.#presenter.initMap(mapContainer);
        this.#presenter.setMapView(story.lat, story.lon);
        this.#presenter.addMarker(
          story.lat,
          story.lon,
          this._createPopupContent(story),
          this.#defaultIcon
        );
      }

      const mainContent = document.getElementById("main-content");
      if (mainContent && window.location.hash.includes("#main-content")) {
        mainContent.focus();
      }
    } catch (error) {
      contentContainer.innerHTML = `
        <div id="main-content" class="error-message" tabindex="-1">
          Gagal memuat cerita. ${error.message}
        </div>
      `;
    }
  }

  async _toggleFavorite(storyId, story) {
    const favoriteBtn = document.getElementById("favoriteBtn");
    const isFavorite = await IDBHelper.isFavorite(storyId);

    try {
      if (isFavorite) {
        await IDBHelper.deleteFavoriteStory(storyId);
        favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Tambahkan ke Favorit';
        favoriteBtn.classList.remove("active");
        favoriteBtn.title = "Tambahkan ke favorit";

        await Swal.fire({
          icon: "success",
          title: "Dihapus dari Favorit",
          text: "Cerita telah dihapus dari favorit",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await IDBHelper.addFavoriteStory(story);
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Hapus dari Favorit';
        favoriteBtn.classList.add("active");
        favoriteBtn.title = "Hapus dari favorit";

        await Swal.fire({
          icon: "success",
          title: "Ditambahkan ke Favorit",
          text: "Cerita berhasil disimpan ke favorit",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
      });
    }
  }

  _createPopupContent(story) {
    return `
      <div class="popup-content">
        <h3>${story.name}</h3>
        <img src="${story.photoUrl}" alt="Foto dari ${
      story.name
    }" style="max-width: 200px;">
        <p>${story.description}</p>
        <div class="popup-coordinates">
          <strong>Koordinat:</strong><br>
          Lat: ${story.lat.toFixed(6)}<br>
          Lng: ${story.lon.toFixed(6)}
        </div>
      </div>
    `;
  }

  async destroy() {
    this.#presenter.destroyMap();
  }
}

export default DetailStoryPage;