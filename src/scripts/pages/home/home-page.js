export default class HomePage {
  async render() {
    return `
      <div class="skip-link">
        <a href="#/stories" class="skip-to-content">Lewati ke konten utama</a>
      </div>

      <section id="mainContent" class="container">
        <div class="home-content">
          <h1 class="home-title">Selamat Datang di Story App</h1>
          
            <div class="cta-container">
              <a href="#/stories" class="cta-button">
                <i class="fas fa-book"></i> Lihat Cerita
              </a>
              <a href="#/stories/add" class="cta-button cta-button--primary">
                <i class="fas fa-plus"></i> Tambah Cerita
              </a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Implementasi tambahan jika diperlukan
  }
}
