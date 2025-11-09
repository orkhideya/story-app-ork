export default class AboutPage {
  async render() {
    return `
      </div>

      <section id="mainContent" class="about container">
        <div class="about-content" role="main">
          <h1 class="about-title">
            <i class="fas fa-info-circle" aria-hidden="true"></i> 
            Tentang Story App
          </h1>

          <div class="about-description">
            <p>Aplikasi ini memungkinkan pengguna untuk berbagi momen spesial mereka dalam bentuk cerita dan foto.</p>
            
            <div class="about-features">
              <h2>Fitur Utama:</h2>
              <ul>
                
                <li>
                  <i class="fas fa-camera" aria-hidden="true"></i>
                  <div>
                    <h3>Upload Foto</h3>
                  </div>
                </li>
                <li>
                  <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                  <div>
                    <h3>Akses Lokasi</h3>
                  </div>
                </li>
                <li>
                  <i class="fas fa-globe" aria-hidden="true"></i>
                  <div>
                    <h3>Simpan Cerita</h3>
                  </div>
                </li>
              </ul>
            </div>
            
            <div class="about-credits">
              <h2>Dikembangkan Oleh:</h2>
              <p>
                <i class="fas fa-user-circle" aria-hidden="true"></i>
                Arya Pandya Mahardika
              </p>
              <p class="credits-note">
                Submission Belajar Pengembangan Web Intermediate.
              </p>
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
