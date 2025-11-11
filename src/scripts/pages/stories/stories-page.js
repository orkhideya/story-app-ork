import StoriesPresenter from "./stories-presenter";
import { showFormattedDate } from "../../utils";
import MapHelper from "../../utils/map-helper";
import IDBHelper from "../../utils/idb-helper";
import Swal from "sweetalert2";

class StoriesPage {
  #presenter = null;
  #map = null;
  #markers = [];

  constructor() {
    this.#presenter = new StoriesPresenter(this);
  }

  async render() {
    return `      
      <section id="mainContent" class="stories container" tabindex="-1">
        <h1 class="stories__title">Lihat Cerita</h1>
        
        <!-- Map dipindahkan ke atas -->
        <div id="map" class="stories__map"></div>
        
        <!-- Stories list di bawah map -->
        <div id="stories" class="stories__list"></div>
        
        <div class="stories__pagination">
          <button id="prevPage" class="pagination-button">
            <i class="fas fa-chevron-left"></i> Sebelumnya
          </button>
          <span id="pageInfo" class="pagination-info">Halaman 1</span>
          <button id="nextPage" class="pagination-button">
            Selanjutnya <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <a href="#/stories/add" class="floating-button" aria-label="Tambah cerita baru">
          <i class="fas fa-plus"></i>
        </a>
      </section>
    `;
  }

  async afterRender() {
    const prevButton = document.getElementById("prevPage");
    const nextButton = document.getElementById("nextPage");
    const pageInfo = document.getElementById("pageInfo");
    const storiesContainer = document.querySelector("#stories");
    const mapContainer = document.querySelector("#map");
    this.#map = MapHelper.initMap(mapContainer, false);

    const loadStories = async (page) => {
      try {
        const result = await this.#presenter.loadStories(page);
        if (!result) return;

        const { stories, hasMore, currentPage } = result;

        storiesContainer.innerHTML = "";
        this.#markers.forEach((marker) => marker.remove());
        this.#markers = [];

        // Render each story
        for (const story of stories) {
          const isFavorite = await IDBHelper.isFavorite(story.id);
          storiesContainer.innerHTML += this._createStoryCard(story, isFavorite);

          if (story.lat && story.lon) {
            const marker = MapHelper.addMarker(
              this.#map,
              story.lat,
              story.lon,
              this._createPopupContent(story)
            );
            this.#markers.push(marker);
          }
        }

        // Setup favorite button listeners
        this._setupFavoriteButtons(stories);

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = !hasMore;
        pageInfo.textContent = `Halaman ${currentPage}`;
      } catch (error) {
        console.error(error);
        storiesContainer.innerHTML =
          '<div class="error-message">Gagal memuat cerita</div>';
      }
    };

    // Pagination event listeners
    prevButton.addEventListener("click", () => {
      const currentPage = parseInt(pageInfo.textContent.split(" ")[1]);
      if (currentPage > 1) {
        loadStories(currentPage - 1);
      }
    });

    nextButton.addEventListener("click", () => {
      const currentPage = parseInt(pageInfo.textContent.split(" ")[1]);
      loadStories(currentPage + 1);
    });

    await loadStories(1);

    const mainContent = document.getElementById("mainContent");
    if (mainContent && window.location.hash === "#mainContent") {
      mainContent.focus();
    }
  }

  _setupFavoriteButtons(stories) {
    const favoriteButtons = document.querySelectorAll(".favorite-btn");
    
    favoriteButtons.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const storyId = btn.dataset.storyId;
        const story = stories.find((s) => s.id === storyId);
        
        if (!story) return;

        const isFavorite = await IDBHelper.isFavorite(storyId);
        
        try {
          if (isFavorite) {
            // Remove from favorites
            await IDBHelper.deleteFavoriteStory(storyId);
            btn.innerHTML = '<i class="far fa-heart"></i>';
            btn.classList.remove("active");
            btn.title = "Tambahkan ke favorit";
            
            await Swal.fire({
              icon: "success",
              title: "Dihapus dari Favorit",
              text: "Cerita telah dihapus dari favorit",
              timer: 1500,
              showConfirmButton: false,
            });
          } else {
            // Add to favorites
            await IDBHelper.addFavoriteStory(story);
            btn.innerHTML = '<i class="fas fa-heart"></i>';
            btn.classList.add("active");
            btn.title = "Hapus dari favorit";
            
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
      });
    });
  }

  _createStoryCard(story, isFavorite = false) {
    const favoriteClass = isFavorite ? "active" : "";
    const favoriteIcon = isFavorite ? "fas fa-heart" : "far fa-heart";
    const favoriteTitle = isFavorite ? "Hapus dari favorit" : "Tambahkan ke favorit";

    return `
      <article class="story-item">
        <button class="favorite-btn ${favoriteClass}" data-story-id="${story.id}" title="${favoriteTitle}">
          <i class="${favoriteIcon}"></i>
        </button>
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
          <a href="#/stories/${story.id}" class="read-more-button">
            Selengkapnya <i class="fas fa-arrow-right"></i>
          </a>
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

export default StoriesPage;