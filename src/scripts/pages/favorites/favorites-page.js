import FavoritesPresenter from "./favorites-presenter";
import { showFormattedDate } from "../../utils";
import MapHelper from "../../utils/map-helper";

class FavoritesPage {
  #presenter = null;
  #map = null;
  #markers = [];

  constructor() {
    this.#presenter = new FavoritesPresenter(this);
  }

  async render() {
    return `      
      <section id="mainContent" class="stories container" tabindex="-1">
        <h1 class="stories__title">
          <i class="fas fa-heart"></i> Cerita Favorit
        </h1>
        
        <p class="favorites-info">
          <i class="fas fa-info-circle"></i> 
          Cerita yang Anda simpan sebagai favorit akan tersimpan secara offline di perangkat Anda
        </p>
        
        <!-- Map -->
        <div id="map" class="stories__map"></div>
        
        <!-- Stories list -->
        <div id="favorites" class="stories__list"></div>
        
        <div id="emptyState" class="empty-state" style="display: none;">
          <i class="fas fa-heart-broken"></i>
          <h2>Belum Ada Favorit</h2>
          <p>Anda belum menyimpan cerita favorit. Klik tombol hati pada cerita untuk menyimpannya!</p>
          <a href="#/stories" class="cta-button">
            <i class="fas fa-book"></i> Lihat Cerita
          </a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const favoritesContainer = document.querySelector("#favorites");
    const mapContainer = document.querySelector("#map");
    const emptyState = document.querySelector("#emptyState");

    // Initialize map
    this.#map = MapHelper.initMap(mapContainer, false);

    await this.loadFavorites();

    // Setup event delegation for delete buttons
    favoritesContainer.addEventListener("click", async (e) => {
      const deleteBtn = e.target.closest(".favorite-delete-btn");
      if (deleteBtn) {
        const storyId = deleteBtn.dataset.storyId;
        await this.#presenter.removeFavorite(storyId);
        await this.loadFavorites();
      }
    });
  }

  async loadFavorites() {
    const favoritesContainer = document.querySelector("#favorites");
    const emptyState = document.querySelector("#emptyState");
    
    try {
      const stories = await this.#presenter.getFavorites();

      // Clear previous markers
      this.#markers.forEach((marker) => marker.remove());
      this.#markers = [];

      if (stories.length === 0) {
        favoritesContainer.style.display = "none";
        emptyState.style.display = "flex";
        return;
      }

      favoritesContainer.style.display = "grid";
      emptyState.style.display = "none";
      favoritesContainer.innerHTML = "";

      // Render stories
      stories.forEach((story) => {
        favoritesContainer.innerHTML += this._createStoryCard(story);

        // Add marker to map if location exists
        if (story.lat && story.lon) {
          const marker = MapHelper.addMarker(
            this.#map,
            story.lat,
            story.lon,
            this._createPopupContent(story)
          );
          this.#markers.push(marker);
        }
      });
    } catch (error) {
      console.error(error);
      favoritesContainer.innerHTML =
        '<div class="error-message">Gagal memuat cerita favorit</div>';
    }
  }

  _createStoryCard(story) {
    return `
      <article class="story-item">
        <div class="story-item__favorite-badge">
          <i class="fas fa-heart"></i> Favorit
        </div>
        <img src="${story.photoUrl}" alt="Foto dari ${
      story.name
    }" class="story-item__image">
        <div class="story-item__content">
          <h2 class="story-item__title">${story.name}</h2>
          <p class="story-item__description">${story.description}</p>
          <p class="story-item__date">
            <i class="far fa-calendar-alt"></i> ${showFormattedDate(
              story.createdAt
            )}
          </p>
          <div class="story-item__actions">
            <a href="#/stories/${story.id}" class="read-more-button">
              Selengkapnya <i class="fas fa-arrow-right"></i>
            </a>
            <button class="favorite-delete-btn" data-story-id="${story.id}" title="Hapus dari favorit">
              <i class="fas fa-trash-alt"></i> Hapus
            </button>
          </div>
        </div>
      </article>
    `;
  }

  _createPopupContent(story) {
    return `
      <div class="popup-content">
        <h3>${story.name}</h3>
        <img src="${story.photoUrl}" alt="Foto dari ${story.name}" style="max-width: 200px;">
        <p>${story.description}</p>
      </div>
    `;
  }

  async destroy() {
    if (this.#map) {
      this.#map.remove();
      this.#map = null;
    }
  }
}

export default FavoritesPage;