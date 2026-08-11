<template>
  <div class="home-container">
    <!-- Header Navigation -->
    <HomeHeader />

    <!-- Main Content -->
    <main class="home-main">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container-fluid">
          <div class="row align-items-center hero-content">
            <div class="col-lg-6 col-12 hero-text-section">
              <h1 class="hero-title">
                A Melhor Diversão <br />
                Para <span class="highlight-orange">As Suas</span> <br />
                <span class="highlight-orange">Crianças</span> Está Aqui
              </h1>

              <p class="hero-description">
                Organizamos eventos inesquecíveis com segurança, alegria e ao
                lado melhores parceiros do país.
              </p>

              <!-- Shipping Policy Notice -->
              <div class="shipping-notice">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Entregas disponíveis apenas em Portugal Continental
              </div>
            </div>

            <div class="col-lg-6 col-12 hero-image-section">
              <div class="hero-image">
                <img
                  src="@/assets/img1.svg"
                  alt="Party illustration"
                  class="illustration"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Specialties Section -->
      <section class="specialties-section">
        <div class="specialties-badge">ESPECIALIDADES</div>
        <h2 class="specialties-title">As Nossas Categorias de Festa</h2>

        <!-- Categories Grid -->
        <div class="row w-100 categories-row">
          <!-- Category 1: Insufláveis -->
          <div class="col-12 col-sm-6 col-xl-3 mb-4">
            <CategoryCard
              title="Insufláveis"
              description="Diversão garantida para saltar o dia todo."
              icon-bg-color="var(--primary-color)"
              :show-icon="true"
            >
              <template #icon>
                <i class="bi bi-shop"></i>
              </template>
            </CategoryCard>
          </div>

          <!-- Category 2: Bolos & Catering -->
          <div class="col-12 col-sm-6 col-xl-3 mb-4">
            <CategoryCard
              title="Bolos & Catering"
              description="Sabores mágicos que as crianças adoram."
              icon-bg-color="var(--color-yellow)"
              :show-icon="true"
            >
              <template #icon>
                <i class="bi bi-cake"></i>
              </template>
            </CategoryCard>
          </div>

          <!-- Category 3: Animação -->
          <div class="col-12 col-sm-6 col-xl-3 mb-4">
            <CategoryCard
              title="Animação"
              description="Palhaços e mascotes para animar a festa."
              icon-bg-color="var(--color-green)"
              :show-icon="true"
            >
              <template #icon>
                <i class="bi bi-star-fill"></i>
              </template>
            </CategoryCard>
          </div>

          <!-- Category 4: Pinturas & Arte -->
          <div class="col-12 col-sm-6 col-xl-3 mb-4">
            <CategoryCard
              title="Pinturas & Arte"
              description="Criatividade sem limites para os pequenos."
              icon-bg-color="var(--color-cyan)"
              :show-icon="true"
            >
              <template #icon>
                <i class="bi bi-palette"></i>
              </template>
            </CategoryCard>
          </div>
        </div>
      </section>

      <!-- Statistics Section -->
      <HomeStats />
    </main>

    <!-- Bottom Navigation (Mobile only) -->
    <BottomNav />
    
    <!-- Footer Section -->
    <HomeFooter />
  </div>
</template>

<script setup>
import { ref } from "vue";
import HomeHeader from "@/components/home/HomeHeader.vue";
import CategoryCard from "@/components/home/CategoryCard.vue";
import HomeStats from "@/components/home/HomeStats.vue";
import BottomNav from "@/components/BottomNav.vue";
import HomeFooter from "@/components/home/HomeFooter.vue";

const handleNavClick = (item) => {
  activeItem.value = item;
  console.log("Navegou para:", item);
};
</script>

<style scoped>
.logo-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.home-container {
  background-color: white;
  
}

.home-main {
  width: 100%;
  background-color: white;
}

/* ===== HERO SECTION ===== */
.hero-section {
  padding: 60px 24px 80px;
}

.hero-content {
  gap: 0px;
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  max-width: 1440px;
  margin: 0 auto;
}

.hero-text-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  min-width: 300px;
  order: 1;
}

.hero-title {
  font-family: "Public Sans", sans-serif;
  font-weight: 900;
  font-size: 68px;
  line-height: 72px;
  color: var(--dark-text);
  margin: 0;
  letter-spacing: -1.5px;
}

.highlight-orange {
  color: var(--primary-color);
}

.hero-description {
  font-family: "Public Sans", sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: var(--secondary-light);
  line-height: 28px;
  margin: 0;
  max-width: 608px;
}

.shipping-notice {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(253, 94, 58, 0.07);
  border: 1px solid rgba(253, 94, 58, 0.2);
  color: var(--primary-color);
  font-family: "Public Sans", sans-serif;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 9999px;
  width: fit-content;
}

.hero-image-section {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-width: 300px;
  order: 2;
}

.hero-image {
  width: 100%;
  aspect-ratio: 569 / 323;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.illustration {
  width: 100%;
  height: 100%;
  max-width: 750px;
  object-fit: contain;
}

/* ===== SPECIALTIES SECTION ===== */
.specialties-section {
  padding: 80px 24px;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.specialties-badge {
  display: inline-block;
  background-color: rgba(253, 94, 58, 0.1);
  border: 1px solid rgba(0, 0, 0, 0);
  border-radius: 9999px;
  padding: 9px 25px;
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 1.4px;
  margin: 0 auto 24px;
  display: block;
  text-align: center;
}

.specialties-title {
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 48px;
  color: var(--dark-text);
  text-align: center;
  margin: 0 auto 64px;
  max-width: 768px;
}

.categories-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  margin-bottom: 48px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.view-all-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.view-all-link {
  color: var(--primary-color);
  font-family: "Public Sans", sans-serif;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.view-all-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1199px) {
  .hero-title {
    font-size: 48px;
    line-height: 48px;
  }

  .specialties-title {
    font-size: 36px;
  }

  .categories-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (max-width: 991px) {
  .hero-section {
    padding: 48px 20px 60px;
  }

  .hero-content {
    gap: 32px;
    flex-direction: column;
  }

  .hero-text-section {
    order: 2;
    text-align: center;
    align-items: center;
  }

  .hero-image-section {
    order: 1;
    display: flex;
    margin-bottom: 32px;
  }

  .hero-title {
    font-size: 36px;
    line-height: 40px;
  }

  .hero-description {
    font-size: 14px;
    line-height: 26px;
  }

  .specialties-section {
    padding: 60px 20px;
  }

  .specialties-title {
    font-size: 28px;
    margin-bottom: 48px;
  }

  .categories-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .hero-image-section {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    order: 1;
  }

  .hero-section {
    padding: 40px 16px 50px;
  }

  .hero-title {
    font-size: 28px;
    line-height: 32px;
    letter-spacing: -0.7px;
  }

  .hero-description {
    font-size: 13px;
    line-height: 24px;
  }

  .specialties-section {
    padding: 48px 16px 60px;
  }

  .specialties-title {
    font-size: 20px;
    margin-bottom: 32px;
  }

  .categories-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 576px) {
  .hero-section {
    padding: 32px 16px 40px;
  }

  .hero-title {
    font-size: 24px;
    line-height: 28px;
  }

  .hero-description {
    font-size: 12px;
    line-height: 22px;
  }

  .specialties-section {
    padding: 40px 16px 40px;
  }

  .specialties-badge {
    margin-bottom: 16px;
  }

  .specialties-title {
    font-size: 18px;
    margin-bottom: 24px;
  }

  .categories-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .bottom-nav {
    padding: 4px 0;
  }

  .nav-item {
    padding: 8px 4px;
    gap: 2px;
    font-size: 9px;
  }
}
</style>
