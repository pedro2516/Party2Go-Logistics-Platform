<template>
  <div class="solicitar-entrega-page">
    <BusinessHeader />

    <!-- Business Bottom Nav (Mobile) -->
    <BusinessBottomNav />

    <div class="page-content">
      <!-- Progress Header -->
      <div class="progress-header">
        <div class="page-title-block">
          <h1 class="page-title">Solicitar Entrega</h1>
          <p class="page-subtitle">
            Preencha os detalhes para a sua nova entrega corporativa.
          </p>
        </div>
        <!-- Mobile-only progress bar -->
        <div class="mobile-progress">
          <div class="progress-labels">
            <span class="progress-label">Progresso do Pedido</span>
            <span class="progress-step">Etapa {{ currentStep }} de 3</span>
          </div>
          <div class="progress-bar-bg">
            <div
              class="progress-bar-fill"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="row m-0 w-100 g-4 align-items-start">
        <!-- Left: Form -->
        <div class="col-12 col-lg-8">
          <!-- Section 1: Ponto de Recolha -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-badge">1</div>
              <h3 class="section-title">Ponto de Recolha</h3>
            </div>
            <div class="row m-0 w-100 g-3 mt-3">
              <div class="col-12">
                <label class="field-label">Endereço de Recolha</label>
                <AddressAutocomplete
                  placeholder="Rua, número e localidade"
                  v-model:street="form.recolha.endereco"
                  @validation-change="recolhaAddressValid = $event"
                  @coordinates="form.recolha.coords = $event"
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="field-label">Data e Hora</label>
                <input
                  type="datetime-local"
                  class="field-input"
                  v-model="form.recolha.datetime"
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="field-label">Contacto no Local</label>
                <input
                  type="text"
                  class="field-input"
                  placeholder="Telemóvel"
                  v-model="form.recolha.contacto"
                />
              </div>
            </div>
            <button
              class="btn-next"
              type="button"
              :disabled="!recolhaValid"
              @click="nextStep(1)"
            >
              Próximo <i class="bi bi-arrow-right"></i>
            </button>
          </div>

          <!-- Section 2: Ponto de Entrega -->
          <div
            class="form-section"
            :class="{ 'section-locked': currentStep < 2 }"
          >
            <div class="section-header">
              <div class="section-badge">2</div>
              <h3 class="section-title">Ponto de Entrega</h3>
            </div>
            <div class="row m-0 w-100 g-3 mt-3">
              <div class="col-12">
                <label class="field-label">Endereço de Entrega</label>
                <AddressAutocomplete
                  placeholder="Rua, número e localidade"
                  v-model:street="form.entrega.endereco"
                  :disabled="currentStep < 2"
                  @validation-change="entregaAddressValid = $event"
                  @coordinates="form.entrega.coords = $event"
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="field-label">Data e Hora</label>
                <input
                  type="datetime-local"
                  class="field-input"
                  v-model="form.entrega.datetime"
                  :disabled="currentStep < 2"
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="field-label">Contacto do Recetor</label>
                <input
                  type="text"
                  class="field-input"
                  placeholder="Telemóvel"
                  v-model="form.entrega.contacto"
                  :disabled="currentStep < 2"
                />
              </div>
              <div class="col-12">
                <label class="field-label">Instruções de Entrega (Opcional)</label>
                <div class="input-icon-wrapper" style="align-items: flex-start;">
                  <i class="bi bi-chat-left-text input-icon" style="top: 20px;"></i>
                  <textarea
                    class="field-input"
                    placeholder="Ex: Deixar na portaria, campainha avariada..."
                    v-model="form.entrega.instructions"
                    :disabled="currentStep < 2"
                    rows="2"
                    style="resize: vertical; min-height: 52px; padding-top: 12px; padding-left: 40px;"
                  ></textarea>
                </div>
              </div>
            </div>
            <button
              class="btn-next"
              type="button"
              :disabled="!entregaValid || currentStep < 2"
              @click="nextStep(2)"
            >
              Próximo <i class="bi bi-arrow-right"></i>
            </button>
          </div>

          <!-- Section 3: Detalhes da Mercadoria -->
          <div
            class="form-section"
            :class="{ 'section-locked': currentStep < 3 }"
          >
            <div class="section-header">
              <div class="section-badge">3</div>
              <h3 class="section-title">Detalhes da Mercadoria</h3>
            </div>
            <div class="row m-0 w-100 g-3 mt-3">
              <div class="col-12">
                <label class="field-label">Tipo de Material</label>
                <div class="material-types">
                  <button
                    v-for="m in materialTypes"
                    :key="m.value"
                    class="material-btn"
                    :class="{ active: currentMercadoria.tipo === m.value }"
                    type="button"
                    @click="currentMercadoria.tipo = m.value"
                  >
                    <i :class="['bi', m.icon, 'material-icon']"></i>
                    <span>{{ m.label }}</span>
                  </button>
                </div>
              </div>
              <div
                v-if="currentMercadoria.tipo === 'outro'"
                class="col-12"
              >
                <label class="field-label">Descrição do Material</label>
                <input
                  type="text"
                  class="field-input"
                  placeholder="Descreva o tipo de material..."
                  v-model="currentMercadoria.outroDescricao"
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="field-label">Peso Estimado (kg)</label>
                <input
                  type="number"
                  class="field-input"
                  placeholder="ex: 15"
                  v-model="currentMercadoria.peso"
                />
              </div>
              <div class="col-12 col-md-6">
                <label class="field-label">Dimensões (CxLxA cm)</label>
                <input
                  type="text"
                  class="field-input"
                  placeholder="ex: 40x40x20"
                  v-model="currentMercadoria.dimensoes"
                />
              </div>
              <div class="col-12">
                <h4 class="text-sm font-medium text-gray-700 mb-3">Requisitos da Entrega</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="req in deliveryRequirements"
                    :key="req.id"
                    class="requirement-card"
                    :class="{ active: selectedRequirements.includes(req.id) }"
                    @click="toggleRequirement(req.id)"
                  >
                    <i :class="['requirement-icon', 'bi', req.icon]"></i>
                    <div class="requirement-content">
                      <h5 class="requirement-title">{{ req.title }}</h5>
                      <p class="requirement-desc">{{ req.desc }}</p>
                    </div>
                    <i v-if="selectedRequirements.includes(req.id)" class="bi bi-check-circle-fill requirement-check"></i>
                  </div>
                </div>
              </div>
            </div>
            <button class="btn-add-item" type="button" @click="addMercadoria">
              <i class="bi bi-plus-circle"></i>
              Adicionar ao Resumo
            </button>
          </div>
        </div>

        <!-- Right: Progress + Order Summary -->
        <div class="col-12 col-lg-4 summary-column">
          <!-- Progress Block (sticky) -->
          <div class="progress-sticky-card">
            <div class="progress-labels">
              <span class="progress-label">Progresso do Pedido</span>
              <span class="progress-step">Etapa {{ currentStep }} de 3</span>
            </div>
            <div class="progress-bar-bg">
              <div
                class="progress-bar-fill"
                :style="{ width: progressPercent + '%' }"
              ></div>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-header">
              <i class="bi bi-receipt summary-icon"></i>
              <span class="summary-title">Resumo do Pedido</span>
            </div>
            <div class="summary-body">
              <!-- Recolha -->
              <div v-if="form.recolha.endereco" class="summary-section">
                <div class="summary-section-title">
                  <i class="bi bi-geo-alt"></i> Recolha
                </div>
                <p class="summary-info">{{ form.recolha.endereco }}</p>
                <p v-if="form.recolha.datetime" class="summary-info-sub">
                  {{ form.recolha.datetime }}
                </p>
                <p v-if="form.recolha.contacto" class="summary-info-sub">
                  <i class="bi bi-telephone"></i> {{ form.recolha.contacto }}
                </p>
              </div>
              <!-- Entrega -->
              <div v-if="form.entrega.endereco" class="summary-section">
                <div class="summary-section-title">
                  <i class="bi bi-flag"></i> Entrega
                </div>
                <p class="summary-info">{{ form.entrega.endereco }}</p>
                <p v-if="form.entrega.datetime" class="summary-info-sub">
                  {{ form.entrega.datetime }}
                </p>
                <p v-if="form.entrega.contacto" class="summary-info-sub">
                  <i class="bi bi-telephone"></i> {{ form.entrega.contacto }}
                </p>
              </div>
              <!-- Mercadoria list -->
              <div v-if="mercadoriaList.length > 0" class="summary-section">
                <div class="summary-section-title">
                  <i class="bi bi-boxes"></i> Mercadoria ({{
                    mercadoriaList.length
                  }})
                </div>
                <div
                  v-for="(item, index) in mercadoriaList"
                  :key="index"
                  class="summary-item"
                >
                  <div class="summary-item-info">
                    <span class="summary-item-type">{{ item.tipoLabel }}</span>
                    <span
                      v-if="item.peso || item.dimensoes"
                      class="summary-item-details"
                    >
                      {{ item.peso ? item.peso + " kg" : ""
                      }}{{ item.peso && item.dimensoes ? " · " : ""
                      }}{{ item.dimensoes }}
                    </span>
                    <span v-if="item.instrucoes" class="summary-item-details">
                      <i class="bi bi-info-circle"></i> {{ item.instrucoes }}
                    </span>
                    <div v-if="item.requirementTitles && item.requirementTitles.length > 0" class="summary-item-requirements">
                      <ul class="list-none p-0 m-0 mt-2 flex flex-wrap gap-1.5">
                        <li v-for="req in item.requirementTitles" :key="req" class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-[#FF5A36] border border-orange-200">
                          {{ req }}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <button
                    class="btn-remove-item"
                    type="button"
                    @click="removeMercadoria(index)"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
              <!-- Empty state -->
              <div v-else class="summary-empty">
                <i class="bi bi-inbox summary-empty-icon"></i>
                <span>Nenhum item adicionado ainda.</span>
              </div>
              <!-- Confirm -->
              <button
                class="btn-confirm"
                type="button"
                :disabled="mercadoriaList.length === 0"
                @click="confirmOrder"
              >
                Confirmar Pedido
                <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";
import BusinessHeader from "@/components/business/BusinessHeader.vue";
import BusinessBottomNav from "@/components/business/BusinessBottomNav.vue";
import AddressAutocomplete from "@/components/AddressAutocomplete.vue";

const $router = useRouter();

const materialTypes = [
  { value: "bolo", label: "Bolo", icon: "bi-cake2" },
  { value: "insuflavel", label: "Insuflável", icon: "bi-shop" },
  { value: "maquina", label: "Máquina", icon: "bi-gear" },
  { value: "som-luz", label: "Som & Luz", icon: "bi-boombox" },
  { value: "baloes", label: "Balões", icon: "bi-balloon" },
  { value: "outro", label: "Outro", icon: "bi-three-dots" },
];

const currentStep = ref(1);
const progressPercent = computed(() => (currentStep.value / 3) * 100);
const recolhaAddressValid = ref(false);
const entregaAddressValid = ref(false);

const recolhaValid = computed(
  () =>
    recolhaAddressValid.value &&
    form.recolha.endereco.trim() !== "" &&
    form.recolha.datetime !== "" &&
    form.recolha.contacto.trim() !== "",
);
const entregaValid = computed(
  () =>
    entregaAddressValid.value &&
    form.entrega.endereco.trim() !== "" &&
    form.entrega.datetime !== "" &&
    form.entrega.contacto.trim() !== "",
);

function nextStep(from) {
  if (from === 1 && recolhaValid.value && currentStep.value < 2)
    currentStep.value = 2;
  if (from === 2 && entregaValid.value && currentStep.value < 3)
    currentStep.value = 3;
}

const form = reactive({
  recolha: { endereco: "", datetime: "", contacto: "", coords: null },
  entrega: { endereco: "", datetime: "", contacto: "", instructions: "", coords: null },
});

const currentMercadoria = reactive({
  tipo: "bolo",
  peso: "",
  dimensoes: "",
  instrucoes: "",
  outroDescricao: "",
});
const mercadoriaList = ref([]);

const deliveryRequirements = [
  { id: 'superficie_estavel', title: 'Superfície Estável', icon: 'bi-layers', desc: 'Mala ou suporte 100% nivelado para transportar bolos sem danos.' },
  { id: 'carga_pesada', title: 'Carga Pesada', icon: 'bi-shop-window', desc: 'Capacidade física (e carrinho de mão) para descarregar insufláveis pesados sozinho.' },
  { id: 'suporta_volumosos', title: 'Suporta Volumosos', icon: 'bi-box-seam', desc: 'Veículo completamente livre para balões cheios ou painéis decorativos.' },
  { id: 'alimentar_higiene', title: 'Alimentar / Higiene', icon: 'bi-cake', desc: 'Veículo cumpre normas de higiene para transportar comida (bolos, pipocas, algodão doce).' },
  { id: 'servico_instalacao', title: 'Serviço de Instalação', icon: 'bi-gear', desc: 'Formação básica para ligar máquinas de pipocas ou encher/fixar insufláveis no chão.' }
];

const selectedRequirements = ref([]);

function toggleRequirement(id) {
  const index = selectedRequirements.value.indexOf(id);
  if (index > -1) {
    selectedRequirements.value.splice(index, 1);
  } else {
    selectedRequirements.value.push(id);
  }
}

const selectedRequirementTitles = computed(() => {
  return selectedRequirements.value.map(id => {
    const req = deliveryRequirements.find(r => r.id === id);
    return req ? req.title : id;
  });
});

function addMercadoria() {
  const baseLabel =
    materialTypes.find((m) => m.value === currentMercadoria.tipo)?.label ??
    currentMercadoria.tipo;
  const tipoLabel =
    currentMercadoria.tipo === "outro" &&
    currentMercadoria.outroDescricao.trim()
      ? currentMercadoria.outroDescricao.trim()
      : baseLabel;
  mercadoriaList.value.push({
    tipo: currentMercadoria.tipo,
    tipoLabel,
    peso: currentMercadoria.peso,
    dimensoes: currentMercadoria.dimensoes,
    instrucoes: currentMercadoria.instrucoes,
    requirements: [...selectedRequirements.value], // Use raw tag IDs for backend
    requirementTitles: [...selectedRequirementTitles.value], // Keep titles for UI display
  });
  currentMercadoria.tipo = "bolo";
  currentMercadoria.peso = "";
  currentMercadoria.dimensoes = "";
  currentMercadoria.instrucoes = "";
  currentMercadoria.outroDescricao = "";
  selectedRequirements.value = [];
}

function removeMercadoria(index) {
  mercadoriaList.value.splice(index, 1);
}

function confirmOrder() {
  // Create order object with all delivery details
  const order = {
    id: `ORD-${Date.now()}`,
    recolha: { ...form.recolha },
    entrega: { ...form.entrega },
    mercadoriaList: mercadoriaList.value,
    dataCriacao: new Date().toISOString(),
  };

  // Get existing business cart or create new array
  let businessCart = JSON.parse(
    localStorage.getItem("party2go-business-cart") || "[]"
  );

  // Add order to business cart
  businessCart.push(order);

  // Save to localStorage
  localStorage.setItem("party2go-business-cart", JSON.stringify(businessCart));

  // Redirect to business cart
  $router.push("/business/carrinho");
}
</script>

<style scoped>
.solicitar-entrega-page {
  min-height: 100vh;
  background-color: white;
}



@media (max-width: 768px) {
  .solicitar-entrega-page {
    padding-bottom: 80px;
  }
}

.page-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

/* Progress Header */
.progress-header {
  margin-bottom: 32px;
}

/* Mobile-only progress */
.mobile-progress {
  display: none;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.page-title {
  font-size: px;
  font-weight: 800;
  color: var(--dark-text);
  line-height: 52px;
  margin: 0 0 12px;
}

.page-subtitle {
  font-size: 16px;
  color: var(--secondary-light);
  margin: 0;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--secondary-light);
}

.progress-step {
  font-size: 14px;
  font-weight: 500;
  color: var(--primary-color);
}

.progress-bar-bg {
  background-color: var(--bg-lightest);
  height: 8px;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  background-color: var(--primary-color);
  height: 100%;
  border-radius: 9999px;
}

/* Main Layout */
.main-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.form-column {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.summary-column {
  width: 360px;
  flex-shrink: 0;
  position: sticky;
  top: 100px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-sticky-card {
  background-color: white;
  border: 1px solid var(--border-lighter);
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Form Section */
.form-section {
  background-color: rgba(100, 116, 139, 0.05);
  border: 1px solid white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-badge {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background-color: rgba(253, 94, 58, 0.13);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: var(--primary-color);
  flex-shrink: 0;
}

.section-title {
  font-weight: 700;
  font-size: 18px;
  color: var(--dark-text);
  margin: 0;
}

/* Fields Grid */
.section-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group.full-width {
  grid-column: 1 / -1;
}

.field-label {
  font-weight: 600;
  font-size: 14px;
  color: var(--dark-text);
}

.field-input {
  background-color: white;
  border: 1px solid var(--border-lighter);
  border-radius: 16px;
  padding: 13px 15px;
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  color: var(--dark-text);
  outline: none;
  width: 100%;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.04);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.field-input::placeholder {
  color: var(--secondary-light);
}

.field-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(253, 94, 58, 0.12);
}

.input-icon-wrapper {
  position: relative;
}

.input-icon-wrapper .field-input {
  padding-left: 40px;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--secondary-light);
  font-size: 15px;
  pointer-events: none;
}

/* Material Type Buttons */
.material-types {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 600px) {
  .material-types {
    grid-template-columns: repeat(3, 1fr);
  }
}

.material-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px;
  border-radius: 16px;
  border: 2px solid var(--border-lighter);
  background-color: white;
  cursor: pointer;
  font-family: "Public Sans", sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: var(--dark-text);
  transition:
    border-color 0.2s,
    background-color 0.2s;
}

.material-btn.active {
  border-color: var(--primary-color);
  background-color: rgba(253, 94, 58, 0.05);
}

.material-icon {
  font-size: 20px;
  color: var(--dark-text);
  transition: color 0.2s;
}

.material-btn.active .material-icon {
  color: var(--primary-color);
}

.field-textarea {
  background-color: white;
  border: 1px solid var(--border-lighter);
  border-radius: 16px;
  padding: 13px 15px;
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  color: var(--dark-text);
  outline: none;
  width: 100%;
  resize: vertical;
  min-height: 90px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.04);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.field-textarea::placeholder {
  color: var(--secondary-light);
}

.field-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(253, 94, 58, 0.12);
}

/* Summary Card */
.summary-card {
  background-color: white;
  border: 1px solid var(--border-lighter);
  border-radius: 16px;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.summary-header {
  background-color: rgba(253, 94, 58, 0.13);
  border-bottom: 1px solid rgba(253, 94, 58, 0.2);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-icon {
  font-size: 18px;
  color: var(--primary-color);
}

.summary-title {
  font-weight: 700;
  font-size: 16px;
  color: var(--primary-color);
}

.summary-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Summary sections */
.summary-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-lighter);
}

.summary-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.summary-section-title {
  font-weight: 700;
  font-size: 13px;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-info {
  font-size: 13px;
  font-weight: 500;
  color: var(--dark-text);
  margin: 0;
}

.summary-info-sub {
  font-size: 12px;
  color: var(--secondary-light);
  margin: 0;
}

/* Mercadoria items */
.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background-color: var(--bg-lightest);
  border-radius: 10px;
  margin-top: 4px;
}

.summary-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.summary-item-type {
  font-size: 13px;
  font-weight: 600;
  color: var(--dark-text);
}

.summary-item-details {
  font-size: 11px;
  color: var(--secondary-light);
  word-break: break-word;
  overflow-wrap: anywhere;
  white-space: normal;
}

.summary-item-requirements {
  margin-top: 6px;
}

.field-char-count {
  font-size: 11px;
  color: var(--secondary-light);
  text-align: right;
  display: block;
  margin-top: 2px;
}

.btn-remove-item {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--secondary-light);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 6px;
  flex-shrink: 0;
  transition:
    color 0.2s,
    background-color 0.2s;
}

.btn-remove-item:hover {
  color: var(--color-danger);
  background-color: rgba(239, 68, 68, 0.08);
}

/* Empty state */
.summary-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 0;
  color: var(--secondary-light);
  font-size: 13px;
  text-align: center;
}

.summary-empty-icon {
  font-size: 28px;
  opacity: 0.4;
}

/* Add item button */
.section-locked {
  opacity: 0.45;
  pointer-events: none;
  user-select: none;
}

.btn-next {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    opacity 0.2s;
  align-self: flex-end;
}

.btn-next:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-next:not(:disabled):hover {
  background-color: var(--primary-dark);
}

.btn-add-item {
  background-color: rgba(253, 94, 58, 0.08);
  color: var(--primary-color);
  border: 2px dashed rgba(253, 94, 58, 0.35);
  border-radius: 16px;
  padding: 14px;
  width: 100%;
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.btn-add-item:hover {
  background-color: rgba(253, 94, 58, 0.14);
  border-color: var(--primary-color);
}

.btn-confirm {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 16px;
  width: 100%;
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow:
    0px 10px 15px -3px rgba(236, 91, 19, 0.2),
    0px 4px 6px -4px rgba(236, 91, 19, 0.2);
  transition: opacity 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 900px) {
  .page-content {
    padding: 32px 40px 60px;
  }

  .main-layout {
    flex-direction: column;
  }

  .form-column {
    width: 100%;
  }

  .summary-column {
    width: 100%;
    position: static;
    top: auto;
  }

  .progress-sticky-card {
    display: none;
  }

  .mobile-progress {
    display: flex;
  }
}

@media (max-width: 768px) {
  .section-fields {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-content {
    padding: 24px 40px 60px;
  }

  .page-title {
    font-size: 24px;
    text-align: center;
  }

  .page-subtitle {
    text-align: center;
  }

  .form-section {
    padding: 18px 16px;
  }

  .material-types {
    grid-template-columns: repeat(3, 1fr);
  }

  .summary-column {
    gap: 12px;
  }

  .btn-next {
    align-self: stretch;
    justify-content: center;
  }
}

/* Requirement Cards */
.requirement-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border: 1.5px solid var(--border-lighter);
  border-radius: 12px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.requirement-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0px 2px 8px rgba(253, 94, 58, 0.1);
}

.requirement-card.active {
  border-color: #FF5A36;
  background-color: rgba(255, 90, 54, 0.05);
}

.requirement-icon {
  font-size: 24px;
  flex-shrink: 0;
  color: #FF5A36;
  line-height: 1;
  margin-top: 2px;
}

.requirement-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.requirement-title {
  font-family: 'Public Sans', sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: var(--dark-text);
  margin: 0;
}

.requirement-desc {
  font-family: 'Public Sans', sans-serif;
  font-size: 12px;
  color: var(--secondary-light);
  margin: 0;
  line-height: 1.4;
}

.requirement-check {
  font-size: 18px;
  color: #FF5A36;
  flex-shrink: 0;
  margin-top: 2px;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.gap-4 {
  gap: 1rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.text-gray-700 {
  color: #374151;
}

/* Summary Requirements */
.mt-3 {
  margin-top: 0.75rem;
}

.pt-3 {
  padding-top: 0.75rem;
}

.border-t {
  border-top: 1px solid;
}

.border-gray-200 {
  border-color: #E5E7EB;
}

.text-xs {
  font-size: 0.75rem;
}

.font-bold {
  font-weight: 700;
}

.text-gray-600 {
  color: #4B5563;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-1\.5 {
  gap: 0.375rem;
}

.text-\[10px\] {
  font-size: 10px;
}

.bg-orange-50 {
  background-color: #FFF7ED;
}

.border-\[\#FF5A36\] {
  border-color: #FF5A36;
}

.text-\[\#FF5A36\] {
  color: #FF5A36;
}

.border-orange-200 {
  border-color: #FED7AA;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.py-0\.5 {
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded {
  border-radius: 0.25rem;
}

.list-none {
  list-style-type: none;
}

.p-0 {
  padding: 0;
}

.m-0 {
  margin: 0;
}

.mt-2 {
  margin-top: 0.5rem;
}

.inline-flex {
  display: inline-flex;
}

.items-center {
  align-items: center;
}

.font-semibold {
  font-weight: 600;
}
</style>
