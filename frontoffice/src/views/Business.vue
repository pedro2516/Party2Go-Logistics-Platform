<template>
  <div class="business-page">
    <!-- Header Navigation -->
    <BusinessHeader />

    <!-- Business Bottom Nav (Mobile) -->
    <BusinessBottomNav />

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container-fluid hero-container">
        <div class="row align-items-start">
          <!-- Left Content -->
          <div class="col-lg-6 col-12 hero-content">
            <h1 class="hero-title">
              Logística Ideal para<br />
              o seu Negócio de
              <span class="highlight-orange">Festas</span>
            </h1>

            <p class="hero-description">
              Entregamos os seus bolos, insufláveis e decorações com o cuidado
              que os seus clientes merecem. Focamo-nos na excelência para que<br />se
              foque no evento.
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

            <button
              class="btn btn-request-delivery"
              @click="$router.push('/request-delivery')"
            >
              Solicitar Entrega
            </button>
          </div>

          <!-- Right Image -->
          <div class="col-lg-6 col-12 hero-image">
            <img
              :src="deliveryVanImage"
              alt="Delivery van with packages"
              class="delivery-image"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <BusinessStats />

    <!-- Services Section -->
    <section class="services-section">
      <div class="container-fluid services-container">
        <div class="services-header">
          <div class="services-badge">OS NOSSOS SERVIÇOS</div>
          <h2 class="services-title">Soluções sob medida para o seu negócio</h2>
          <p class="services-description">
            Oferecemos a infraestrutura necessária para que as suas festas
            cheguem impecáveis ao destino, desde sobremesas delicadas até
            estruturas monumentais.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import BusinessHeader from "@/components/business/BusinessHeader.vue";
import BusinessBottomNav from "@/components/business/BusinessBottomNav.vue";
import BusinessStats from "@/components/business/BusinessStats.vue";

// Image from Figma asset
const deliveryVanImage =
  "/images/carrinha_1.png";
</script>

<style scoped>
.business-page {
  background-color: white;
  width: 100%;
}

/* Hero Section */
.hero-section {
  padding: 80px 24px;
  background-color: white;
}

.hero-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 40px 0;
  padding-right: 60px;
}

.hero-title {
  font-family: "Public Sans", sans-serif;
  font-weight: 900;
  font-size: 68px;
  line-height: 72px;
  color: var(--dark-text);
  letter-spacing: -1.5px;
  margin-bottom: 24px;
  text-align: left;
}

.hero-title .highlight-orange {
  color: var(--primary-color);
}

.hero-description {
  font-family: "Public Sans", sans-serif;
  font-weight: 400;
  font-size: 20px;
  line-height: 1.6;
  color: var(--secondary-light);
  margin-bottom: 24px;
  text-align: left;
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
  margin-bottom: 50px;
}

.btn-request-delivery {
  background-color: var(--primary-color);
  color: white;
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 16px;
  padding: 15.5px 32px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  width: fit-content;
  box-shadow:
    0px 20px 25px -5px rgba(236, 91, 19, 0.3),
    0px 8px 10px -6px rgba(236, 91, 19, 0.3);
  transition: all 0.3s ease;
}

.btn-request-delivery:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow:
    0px 25px 30px -5px rgba(236, 91, 19, 0.4),
    0px 10px 12px -6px rgba(236, 91, 19, 0.4);
}

.hero-image {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 40px 0;
}

.delivery-image {
  width: 100%;
  max-width: 608px;
  height: auto;
  border-radius: 25px;
  object-fit: cover;
}

/* Services Section */
.services-section {
  padding: 120px 24px;
  background-color: white;
}

.services-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
}

.services-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 818px;
  margin: 0 auto;
}

.services-badge {
  font-family: "Public Sans", sans-serif;
  font-weight: 900;
  font-size: 14px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--primary-color);
}

.services-title {
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 36px;
  line-height: 1.1;
  color: var(--dark-text);
  text-align: center;
  letter-spacing: -0.9px;
}

.services-description {
  font-family: "Public Sans", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  color: var(--secondary-light);
  text-align: center;
  max-width: 700px;
}

/* Responsive Design */
@media (max-width: 992px) {
  .hero-section {
    padding: 60px 16px;
  }

  .hero-title {
    font-size: 42px;
    margin-bottom: 30px;
  }

  .hero-description {
    font-size: 18px;
    margin-bottom: 40px;
  }

  .hero-image {
    padding-top: 40px;
  }
}

@media (max-width: 576px) {
  .hero-section {
    padding: 8px 16px;
  }

  .hero-content {
    padding: 20px 0;
    order: 2;
    align-items: center;
  }

  .hero-image {
    order: 1;
  }

  .hero-title {
    font-size: 32px;
    line-height: 1.3;
    margin-bottom: 20px;
    text-align: center;
  }

  .hero-description {
    font-size: 16px;
    margin-bottom: 30px;
    text-align: center;
  }

  .services-section {
    padding: 40px 16px 80px;
  }

  .services-title {
    font-size: 24px;
  }

  .services-description {
    font-size: 14px;
  }
}


/* Add bottom padding to page for mobile nav */
@media (max-width: 768px) {
  .business-page {
    padding-bottom: 80px;
  }
}
</style>
