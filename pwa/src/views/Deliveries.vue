<template>
  <!-- SUCCESS VIEW -->
  <div v-if="showSuccess" class="success-page">
    <div class="success-content">

      <!-- LOADING STATE: Skeleton while fetching completed order data -->
      <template v-if="successLoading">
        <div class="success-icon-wrapper">
          <div class="success-circle success-circle--loading">
            <i class="bi bi-arrow-repeat spin checkmark-icon"></i>
          </div>
        </div>
        <h1 class="success-title">A processar...</h1>
        <p class="success-subtitle">A confirmar os detalhes da entrega.</p>
        <!-- Skeleton card -->
        <div class="delivery-summary-box">
          <div class="summary-header">
            <span class="skeleton-line" style="width: 120px; height: 14px;"></span>
            <span class="skeleton-line" style="width: 90px; height: 14px;"></span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-body">
            <div v-for="n in 3" :key="n" class="summary-item">
              <span class="skeleton-circle"></span>
              <div class="summary-info">
                <span class="skeleton-line" style="width: 80px; height: 10px; margin-bottom: 6px;"></span>
                <span class="skeleton-line" style="width: 160px; height: 14px;"></span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ERROR / NOT FOUND STATE -->
      <template v-else-if="successError">
        <div class="success-icon-wrapper">
          <div class="success-circle" style="background: #dc2626;">
            <i class="bi bi-exclamation-triangle-fill checkmark-icon"></i>
          </div>
        </div>
        <h1 class="success-title">Detalhes da entrega não encontrados</h1>
        <p class="success-subtitle">{{ successError }}</p>
        <div class="action-buttons">
          <button class="btn-primary" @click="goBackToDeliveries">VOLTAR ÀS ENTREGAS</button>
        </div>
      </template>

      <!-- SUCCESS STATE: Dynamic data loaded -->
      <template v-else>
        <!-- Success Animation / Icon -->
        <div class="success-icon-wrapper">
          <div class="success-circle">
            <i class="bi bi-check-circle-fill checkmark-icon"></i>
          </div>
        </div>

        <h1 class="success-title">Entrega Concluída!</h1>
        <p class="success-subtitle">O pedido foi entregue com sucesso ao destinatário.</p>

        <!-- Summary Card -->
        <div class="delivery-summary-box">
          <div class="summary-header">
            <span class="summary-id">Pedido #{{ completedDelivery.orderId }}</span>
            <span class="summary-date">{{ completedDelivery.completionDate }}</span>
          </div>
          
          <div class="summary-divider"></div>
          
          <div class="summary-body">
            <div class="summary-item">
              <i class="bi bi-person"></i>
              <div class="summary-info">
                <label>Destinatário</label>
                <span>{{ completedDelivery.recipientName }}</span>
              </div>
            </div>
            
            <div class="summary-item">
              <i class="bi bi-geo-alt"></i>
              <div class="summary-info">
                <label>Local de Entrega</label>
                <span>{{ completedDelivery.deliveryAddress }}</span>
              </div>
            </div>
            
            <div class="summary-item">
              <i class="bi bi-clock"></i>
              <div class="summary-info">
                <label>Horário de Conclusão</label>
                <span>
                  {{ completedDelivery.completionTime }}
                  <span 
                    class="time-badge" 
                    :class="completedDelivery.isOnTime ? 'time-badge--on-time' : 'time-badge--late'"
                  >
                    {{ completedDelivery.isOnTime ? '(No Horário)' : '(Atrasado)' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn-primary" @click="goBackToDeliveries">
            VOLTAR ÀS ENTREGAS
          </button>
          <button class="btn-secondary" @click="goToHistoryFromSuccess">
            VER HISTÓRICO
          </button>
        </div>
      </template>
    </div>
  </div>

  <div v-else class="deliveries-root">
    <!-- DETAILS VIEW -->
    <template v-if="selectedOrder">
      <DeliveryHistoryDetails 
        v-if="selectedOrder.status === 'CONCLUÍDA' || selectedOrder.status === 'CANCELADA' || selectedOrder.status === 'DEVOLVIDA'"
        :order="selectedOrder" 
        @go-back="selectedOrder = null" 
      />
      <DeliveryDetails 
        v-else
        :order="selectedOrder" 
        @go-back="selectedOrder = null" 
        @confirm-delivery="handleDeliveryConfirmed" 
      />
    </template>

    <!-- LIST VIEW -->
    <template v-else>
      <!-- Loading State -->
      <div v-if="loadingOrders" class="state-message" style="min-height: 80vh;">
        <i class="bi bi-arrow-repeat spin"></i>
        <span>{{ activeTab === 'pending' ? 'A carregar entregas...' : 'A carregar Histórico...' }}</span>
      </div>

      <template v-else>
        <!-- ==================== DESKTOP VIEW ==================== -->
        <div class="desktop-view min-vh-100 bg-white p-3 d-flex flex-column">
        <div style="width: 100%; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; flex: 1;">

          <div class="entregas-main">

            <div class="delivery-history-section" style="margin-bottom: 2rem;">
              <!-- Header -->
              <div class="section-header" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; flex-wrap: nowrap; min-height: 82px;">
                <div v-if="activeTab === 'pending'" style="display: flex; flex-direction: column; flex-shrink: 0;">
                  <h2 class="section-title">Entregas de Hoje</h2>
                  <p class="section-subtitle">{{ pendingSubtitle }}</p>
                </div>
                <div v-if="activeTab === 'history'" style="flex-shrink: 0;">
                  <h2 class="section-title">Histórico de Entregas</h2>
                  <p class="section-subtitle">{{ historySubtitle }}</p>
                </div>

                <div v-if="activeTab === 'pending'" style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px; flex-shrink: 0;">
                </div>
              </div>

              <!-- Tabs -->
              <div class="tabs-container" style="display: flex; justify-content: space-between; align-items: flex-end; min-height: 64px;">
                <div style="display: flex; gap: 24px; align-items: center;">
                  <button class="tab-button" :class="{ 'tab-button--active': activeTab === 'pending' }" @click="activeTab = 'pending'; isSelectionMode = false">Pendentes</button>
                  <button class="tab-button" :class="{ 'tab-button--active': activeTab === 'history' }" @click="activeTab = 'history'; isSelectionMode = false">Histórico</button>
                </div>
              </div>
            </div>

            <div class="entregas-container">
              <div class="entregas-left-column">
                <div class="delivery-history-section">
                  <!-- Pendentes Cards -->
                  <div v-if="activeTab === 'pending'" class="row m-0 g-4" style="padding: 2rem 0;">
                    <div 
                      v-for="order in pendingOrders" 
                      :key="order.id"
                      class="col-12 col-lg-6"
                    >
                      <div class="d-card h-100" 
                      :class="{ 'd-card-risk': order.risk, 'd-card--selected': selectedDeliveryIds.includes(order.id), 'd-card--locked': isLocked(order.id) }"
                      @click="toggleOrderSelection(order.id)"
                    >
                      <div class="d-card-top">
                        <div style="display: flex; align-items: center; gap: 12px;">
                          <span class="d-badge" :class="{ 'd-badge-risk': order.risk, 'd-badge-next': !order.risk }">{{ order.badge }}</span>
                          <span v-if="isLocked(order.id)" class="d-badge-waiting">EM ESPERA</span>
                        </div>
                        <span class="d-time">{{ order.time }}</span>
                      </div>
                      <div class="d-card-middle">
                        <h3 class="d-location">{{ order.location }}</h3>
                        <span class="d-delivery-type" style="text-transform: none;">{{ order.clientName || 'Cliente' }}</span>
                      </div>
                      <button 
                        class="d-btn-details" 
                        :disabled="isLocked(order.id)"
                        :style="isLocked(order.id) ? 'opacity:0.4;cursor:not-allowed;' : ''"
                        @click.stop="isLocked(order.id) ? null : (selectedOrder = { id: order.id, status: 'EM TRÂNSITO' })"
                      >
                        <i class="bi bi-chevron-up"></i>
                        {{ isLocked(order.id) ? 'EM ESPERA' : 'VER DETALHES' }}
                      </button>
                    </div>
                    </div>

                    <div v-if="pendingOrders.length === 0" class="col-12 col-lg-6">
                      <div class="d-card d-card-placeholder h-100">
                      <div class="d-placeholder-content">
                        <div class="d-placeholder-icon"><i class="bi bi-check-circle" style="font-size: 32px; color: #16a34a;"></i></div>
                        <h4 class="d-placeholder-title">Tudo Concluído!</h4>
                        <p class="d-placeholder-text">Não existem entregas pendentes para hoje.</p>
                      </div>
                    </div>
                    </div>

                    <div v-if="pendingOrders.length > 0" class="col-12 col-lg-6">
                      <div class="d-card d-card-placeholder h-100">
                      <div class="d-placeholder-content">
                        <div class="d-placeholder-icon">+</div>
                        <h4 class="d-placeholder-title">Nova Tarefa Pendente</h4>
                        <p class="d-placeholder-text">O sistema está a calcular o próximo ponto de entrega ideal.</p>
                      </div>
                    </div>
                    </div>
                  </div>

                  <!-- Histórico Cards Layout -->
                  <div v-if="activeTab === 'history'" class="row m-0 g-4" style="padding-top: 1rem;">
                    
                    <!-- Loading Skeleton -->
                    <template v-if="loadingOrders">
                      <div v-for="n in 3" :key="'skel-d-'+n" class="col-12">
                        <div class="delivery-card" style="border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                          <div class="skeleton-pulse" style="width: 80px; height: 24px; border-radius: 9999px; background-color: #e5e7eb;"></div>
                          <div class="skeleton-pulse" style="width: 60px; height: 16px; background-color: #e5e7eb; border-radius: 4px;"></div>
                        </div>
                        <div class="skeleton-pulse" style="width: 150px; height: 16px; background-color: #e5e7eb; border-radius: 4px; margin-bottom: 8px;"></div>
                        <div class="skeleton-pulse" style="width: 100%; height: 16px; background-color: #e5e7eb; border-radius: 4px; margin-bottom: 8px;"></div>
                        <div class="skeleton-pulse" style="width: 100px; height: 36px; background-color: #e5e7eb; border-radius: 8px; margin-top: 16px;"></div>
                        </div>
                      </div>
                    </template>

                    <!-- Empty State -->
                    <div v-else-if="historyOrders.length === 0" class="col-12">
                      <div style="border: 2px dashed #e5e7eb; border-radius: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1rem; text-align: center; background-color: rgba(255, 255, 255, 0.5);">
                      <i class="bi bi-clock-history" style="font-size: 2.25rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                      <h3 style="font-size: 1.125rem; font-weight: 700; color: #9ca3af; margin-bottom: 0.5rem; font-family: 'Public Sans', sans-serif;">Sem Histórico</h3>
                      <p style="font-size: 0.875rem; color: #9ca3af; font-family: 'Public Sans', sans-serif; margin: 0;">Ainda não tem entregas concluídas registadas.</p>
                      </div>
                    </div>

                    <!-- Populated State: History Cards -->
                    <template v-else>
                      <div v-for="order in historyOrders" :key="order.id" class="col-12">
                        <div class="delivery-card">
                        <div class="delivery-card-header">
                          <span 
                            class="delivery-badge"
                            :class="order.status === 'CONCLUÍDA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                          >
                            {{ order.badge }}
                          </span>
                          <span class="delivery-id">{{ order.code }}</span>
                        </div>
                        <div class="delivery-recipient" style="font-family: 'Public Sans', sans-serif; font-size: 15px; font-weight: 600; color: #103841; display: flex; align-items: center; gap: 8px;">
                          <i class="bi bi-person" style="color: #ff6b35;"></i>
                          <span>{{ order.clientName || 'Cliente' }}</span>
                        </div>
                        <div class="delivery-address" style="display: flex; align-items: flex-start; gap: 8px;">
                          <i class="bi bi-geo-alt" style="color: #9ca3af; margin-top: 4px;"></i>
                          {{ order.location }}
                        </div>
                        <div class="delivery-time">
                          <i class="bi bi-clock"></i>
                          <span>{{ order.createdAt }} · Finalizado às {{ order.time }}</span>
                        </div>
                        <div class="delivery-footer">
                          <button class="delivery-details-btn" @click="selectedOrder = order">Ver Detalhes</button>
                        </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>

      <!-- ==================== MOBILE VIEW ==================== -->
      <div class="mobile-view">
        <!-- Header (Fixed for both tabs) -->
        <section class="m-title-section">
          <div class="m-title-container">
            <h1 class="m-title">{{ activeTab === 'pending' ? 'Entregas de Hoje' : 'Histórico de Entregas' }}</h1>
            <p class="m-subtitle">{{ activeTab === 'pending' ? pendingSubtitle : historySubtitle }}</p>
          </div>
        </section>

        <!-- Tabs Section (Shared) -->
        <section class="m-tabs-section">
          <div class="m-tabs">
            <button class="m-tab" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'; isSelectionMode = false">Pendentes</button>
            <button class="m-tab" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'; isSelectionMode = false">Histórico</button>
          </div>
        </section>

        <!-- Content -->
        <div class="m-content">
          <!-- PENDENTES TAB -->
          <template v-if="activeTab === 'pending'">
            <section class="m-cards-section">
              <div 
                v-for="order in pendingOrders" 
                :key="order.id"
                class="m-card" 
                :class="{ 'm-card-risk': order.risk, 'm-card--selected': selectedDeliveryIds.includes(order.id), 'm-card--locked': isLocked(order.id) }"
                @click="toggleOrderSelection(order.id)"
              >
                <div class="m-card-content">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 8px; align-items: center;">
                      <span class="m-badge" :class="{ 'm-badge-risk': order.risk, 'm-badge-next': !order.risk }">{{ order.badge }}</span>
                      <span v-if="isLocked(order.id)" class="m-badge-waiting">EM ESPERA</span>
                    </div>
                  </div>
                  <div class="m-time" :class="{ 'm-time-risk': order.risk }">{{ order.time }}</div>
                  <div class="m-location-row">
                    <i class="bi bi-geo-alt"></i>
                    <span class="m-location">{{ order.location }}</span>
                  </div>
                  <span class="m-delivery-type" style="text-transform: none;">{{ order.clientName || 'Cliente' }}</span>
                  <button 
                    class="m-btn-details" 
                    :disabled="isLocked(order.id)"
                    :style="isLocked(order.id) ? 'opacity:0.4;cursor:not-allowed;background:#e2e8f0;color:#94a3b8;' : ''"
                    @click.stop="isLocked(order.id) ? null : (selectedOrder = { id: order.id, status: 'EM TRÂNSITO' })"
                  >
                    <i v-if="!isLocked(order.id)" class="bi bi-chevron-up"></i>
                    <i v-else class="bi bi-lock"></i>
                    {{ isLocked(order.id) ? 'EM ESPERA' : 'VER DETALHES' }}
                  </button>
                </div>
              </div>

              <div v-if="pendingOrders.length > 0" class="m-card" style="border: 2px dashed #cbd5e1; background: transparent; display: flex; align-items: center; justify-content: center; padding: 24px; text-align: center; box-shadow: none;">
                <div class="m-card-content" style="align-items: center;">
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; color: #64748b; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 8px;">+</div>
                  <h4 style="font-family: 'Public Sans'; font-size: 14px; font-weight: 700; color: #475569; margin: 0 0 4px;">Nova Tarefa Pendente</h4>
                  <p style="font-family: 'Public Sans'; font-size: 12px; color: #94a3b8; margin: 0;">O sistema está a calcular o próximo ponto de entrega ideal.</p>
                </div>
              </div>

              <div v-if="pendingOrders.length === 0" style="text-align: center; padding: 40px 20px;">
                <i class="bi bi-check-circle" style="font-size: 48px; color: #16a34a; margin-bottom: 16px; display: block;"></i>
                <h3 style="color: #103841; font-weight: 800;">Tudo Concluído!</h3>
                <p style="color: #64748b; font-size: 14px;">Não tens entregas pendentes.</p>
              </div>
            </section>
          </template>

          <!-- HISTÓRICO TAB -->
          <template v-if="activeTab === 'history'">
            <div class="m-history-content">

              <!-- Concluídas Header -->
              <div style="padding: 0 16px 12px; font-family: 'Public Sans'; font-size: 11px; font-weight: 700; color: #ff6b35; text-transform: uppercase;">
                 Entregas Concluídas
              </div>

              <!-- History Cards (using mobile style) -->
              <section class="m-cards-section" style="padding-top: 0;">
                
                <!-- Loading Skeleton (Mobile) -->
                <template v-if="loadingOrders">
                  <div v-for="n in 3" :key="'skel-m-'+n" class="m-card" style="border: 1px solid #e0e0e0; background: #fff;">
                    <div class="m-card-content" style="gap: 10px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="skeleton-pulse" style="width: 70px; height: 20px; border-radius: 50px; background-color: #e5e7eb;"></div>
                        <div class="skeleton-pulse" style="width: 60px; height: 14px; background-color: #e5e7eb;"></div>
                      </div>
                      <div class="skeleton-pulse" style="width: 60%; height: 14px; background-color: #e5e7eb;"></div>
                      <div class="skeleton-pulse" style="width: 80%; height: 12px; background-color: #e5e7eb;"></div>
                      <div class="skeleton-pulse" style="width: 100%; height: 38px; border-radius: 8px; background-color: #e5e7eb;"></div>
                    </div>
                  </div>
                </template>

                <!-- Empty State -->
                <div v-else-if="historyOrders.length === 0" style="border: 2px dashed #e5e7eb; border-radius: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1rem; text-align: center; background-color: rgba(255, 255, 255, 0.5);">
                  <i class="bi bi-clock-history" style="font-size: 2.25rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                  <h3 style="font-size: 1.125rem; font-weight: 700; color: #9ca3af; margin-bottom: 0.5rem; font-family: 'Public Sans', sans-serif;">Sem Histórico</h3>
                  <p style="font-size: 0.875rem; color: #9ca3af; font-family: 'Public Sans', sans-serif; margin: 0;">Ainda não tem entregas concluídas registadas.</p>
                </div>

                <!-- Populated State: Mobile History Cards -->
                <template v-else>
                  <div 
                    v-for="order in historyOrders" 
                    :key="order.id" 
                    class="m-card m-card-done" 
                    :style="{
                      border: '1px solid #e0e0e0',
                      borderLeft: order.status === 'CONCLUÍDA' ? '4px solid #16a34a' : '4px solid #dc2626',
                      background: '#fff'
                    }"
                  >
                    <div class="m-card-content" style="gap: 10px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span 
                          class="m-badge" 
                          :class="order.status === 'CONCLUÍDA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                          style="font-size: 10px; padding: 4px 8px; border-radius: 9999px; font-weight: 700; text-transform: uppercase;"
                        >
                          {{ order.badge }}
                        </span>
                        <span style="font-family: 'Public Sans'; font-size: 12px; font-weight: 600; color: #64748b;">{{ order.code }}</span>
                      </div>
                      
                      <div style="display: flex; align-items: center; gap: 6px; font: 600 14px 'Public Sans', sans-serif; color: #103841;">
                        <i class="bi bi-person" style="font-size: 13px; color: #ff6b35;"></i>
                        {{ order.clientName || 'Cliente' }}
                      </div>
                      
                      <div class="m-time" style="font-size: 14px;">{{ order.createdAt }} · {{ order.time }}</div>
                      <div class="m-location-row">
                        <i class="bi bi-geo-alt"></i>
                        <span class="m-location">{{ order.location }}</span>
                      </div>
                      <button class="m-btn-details" style="background: #f1f5f9; color: #103841;" @click="selectedOrder = order">
                        VER DETALHES
                      </button>
                    </div>
                  </div>
                </template>
              </section>
            </div>
          </template>
        </div>
      </div>
      </template>
    </template>

    <!-- CANCELLATION MODAL -->
    <div v-if="showCancelModal" class="cancel-modal-overlay" @click.self="showCancelModal = false">
      <div class="cancel-modal">
        <div class="cancel-modal-header">
          <div class="cancel-icon-wrap">
            <i class="bi bi-x-circle-fill"></i>
          </div>
          <h2 class="cancel-modal-title">Confirmar Cancelamento</h2>
          <p class="cancel-modal-subtitle">Está prestes a cancelar {{ selectedDeliveryIds.length }} {{ selectedDeliveryIds.length === 1 ? 'entrega' : 'entregas' }}. Esta ação não pode ser revertida.</p>
        </div>

        <div class="cancel-modal-body">
          <div class="cancel-selected-list">
            <div v-for="id in selectedDeliveryIds" :key="id" class="cancel-item-pill">
              #{{ pendingOrders.find(o => o.id === id)?.location.split(' - ')[0] || id }}
            </div>
          </div>

          <div class="cancel-reason-section">
            <label class="cancel-label">Motivo do Cancelamento <span style="color: #dc2626;">*</span></label>
            <select v-model="cancelReason" class="cancel-select" :disabled="isCancelling">
              <option value="" disabled selected>Selecione o motivo...</option>
              <option v-for="reason in cancelReasons" :key="reason" :value="reason">{{ reason }}</option>
            </select>
            
            <div v-if="cancelReason === 'Outro motivo'" style="margin-top: 12px;">
              <textarea 
                placeholder="Descreva o motivo detalhadamente..." 
                class="cancel-textarea"
                rows="3"
                :disabled="isCancelling"
              ></textarea>
            </div>
          </div>

          <div v-if="cancelError" class="cancel-error-msg">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>{{ cancelError }}</span>
          </div>
        </div>

        <div class="cancel-modal-footer">
          <button class="cancel-btn-back" @click="showCancelModal = false" :disabled="isCancelling">
            VOLTAR
          </button>
          <button class="cancel-btn-confirm" @click="confirmCancellation" :disabled="isCancelling || !cancelReason">
            <span v-if="isCancelling" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            {{ isCancelling ? 'A PROCESSAR...' : 'CONFIRMAR CANCELAMENTO' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DeliveryDetails from '../components/DeliveryDetails.vue';
import DeliveryHistoryDetails from '../components/DeliveryHistoryDetails.vue';
import { strapiGet, strapiPut, mapOrder } from '@shared/utils/strapi.js';
import { useCourierStore } from '../stores/index.js';

const route = useRoute();
const router = useRouter();
const courierStore = useCourierStore();
const activeTab = ref('pending');
const showSuccess = ref(false);
const successLoading = ref(false);
const successError = ref('');

/**
 * Reactive state for the completed delivery shown on the success page.
 * @typedef {Object} CompletedDelivery
 * @property {string} orderId      - e.g. "12345"
 * @property {string} completionDate - e.g. "22/05/2026"
 * @property {string} recipientName  - e.g. "Pedro Neves"
 * @property {string} deliveryAddress - full address string
 * @property {string} completionTime - e.g. "15:30"
 * @property {boolean} isOnTime      - true = on time, false = late
 */
const completedDelivery = ref({
  orderId: '',
  completionDate: '',
  recipientName: '',
  deliveryAddress: '',
  completionTime: '',
  isOnTime: true,
});
const selectedOrder = ref(null);

// Cancellation feature state
const isSelectionMode = ref(false);
const selectedDeliveryIds = ref([]);
const showCancelModal = ref(false);
const cancelReason = ref('');
const isCancelling = ref(false);
const cancelError = ref('');

const cancelReasons = [
  'Cliente solicitou cancelamento',
  'Morada incorreta/inexistente',
  'Problemas logísticos/veículo',
  'Produto danificado',
  'Outro motivo'
];

// ── Live data ───────────────────────────────────────────────────────────────
const pendingOrders = ref([]);
const historyOrders = ref([]);
const loadingOrders = ref(false);

/** Map a Strapi order entry to the shape the template expects */
function toUiOrder(o) {
  const mapped = mapOrder(o);
  // Ensure we compare in lowercase
  const status = (mapped.status ?? 'pending').toLowerCase();
  const isCompleted = status === 'delivered' || status === 'concluída' || status === 'concluido';
  const isCancelled = status === 'cancelled' || status === 'cancelada';

  return {
    id: mapped.documentId ?? mapped.id,
    documentId: mapped.documentId,
    order_id: mapped.order_id,
    location: mapped.address || 'Endereço não definido',
    type: 'ENTREGA',
    time: mapped.date ? new Date(mapped.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '--:--',
    priority: mapped.priority ?? 1,
    risk: mapped.priority === 5,
    badge: isCompleted ? 'CONCLUÍDA' : isCancelled ? 'CANCELADA' : (mapped.priority === 5 ? 'URGENTE' : 'PRÓXIMA'),
    status: isCompleted ? 'CONCLUÍDA' : isCancelled ? 'CANCELADA' : 'EM TRÂNSITO',
    code: mapped.order_id 
      ? (mapped.order_id.toUpperCase().startsWith('ORD-') ? `#${mapped.order_id.toUpperCase()}` : `#ORD-${mapped.order_id.toUpperCase()}`)
      : `#ORD-${(mapped.documentId || String(mapped.id)).slice(0, 8).toUpperCase()}`,
    clientName: mapped.clientName,
    address: mapped.address,
    createdAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : (mapped.date ? new Date(mapped.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'),
    completedAt: o.updatedAt && (isCompleted || isCancelled) ? new Date(o.updatedAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
    operator: mapped.courierName || 'Não definido',
    items: (mapped.products ?? []).map((p) => ({ name: p.title ?? p.name ?? JSON.stringify(p) })),
    timeline: [],
    reason: o.cancel_reason || o.reason || null,
    photo: o.photo?.url ? `http://localhost:1338${o.photo.url}` : (o.delivery_photo?.url ? `http://localhost:1338${o.delivery_photo.url}` : null),
    signature: o.signature?.url ? `http://localhost:1338${o.signature.url}` : (o.delivery_signature?.url ? `http://localhost:1338${o.delivery_signature.url}` : null)
  };
}

async function fetchOrders() {
  loadingOrders.value = true;
  try {
    const courierDocId = courierStore.courierProfile?.documentId;
    if (!courierDocId) {
      pendingOrders.value = [];
      historyOrders.value = [];
      return;
    }

    const url = `/api/orders?filters[courier_id][documentId][$eq]=${courierDocId}&populate=*&sort=date_delivery:desc`;
    console.log('[Deliveries] Fetch URL:', 'http://localhost:1338' + url);
    
    const json = await strapiGet(url);
    console.log('[Deliveries] API Response:', json.data);
    
    const all = json.data ?? [];
    pendingOrders.value = all
      .filter((o) => {
        const s = (o.order_status || 'pending').toLowerCase().replace(' ', '_');
        return ['pending', 'assigned', 'pendente', 'collecting', 'in_traffic', 'em_recolha', 'em_transito', 'em_trânsito', 'arrived'].includes(s);
      })
      .map(toUiOrder)
      .sort((a, b) => b.priority - a.priority);
      
      historyOrders.value = all
      .filter((o) => {
        const s = (o.order_status || '').toLowerCase();
        return ['delivered', 'cancelled', 'concluída', 'cancelada', 'concluido', 'entregue', 'completed'].includes(s);
      })
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .map(toUiOrder);
  } catch (err) {
    console.warn('[Deliveries] fetchOrders error:', err);
  } finally {
    loadingOrders.value = false;
    
    // Auto-select order if query parameter is present
    if (route.query.orderId && !selectedOrder.value) {
      const target = pendingOrders.value.find(o => o.id === route.query.orderId) 
                  || historyOrders.value.find(o => o.id === route.query.orderId);
      if (target) {
        selectedOrder.value = target;
      }
    }
  }
}

// ── Courier vehicle from auth profile ────────────────────────────────────────
const courierVehicle = computed(() =>
  courierStore.courierProfile?.vehicle ?? 'Veículo não atribuído'
);
const courierPlate = computed(() =>
  courierStore.courierProfile?.licencePlate ?? '—'
);

// ── Priority-based access: only highest-priority (oldest if tied) order is active ──
const activeDeliveryId = computed(() => {
  if (pendingOrders.value.length === 0) return null;
  // Sort by priority desc, then createdAt asc (oldest first when tied)
  const sorted = [...pendingOrders.value].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    // Tie-break: oldest createdAt wins
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  return sorted[0]?.id ?? null;
});

function isLocked(id) {
  return pendingOrders.value.length > 1 && id !== activeDeliveryId.value;
}

// ── Subtitles ─────────────────────────────────────────────────────────────────
const pendingSubtitle = computed(() =>
  pendingOrders.value.length === 1
    ? '1 Serviço Restante'
    : `${pendingOrders.value.length} Serviços Restantes`
);
const historySubtitle = computed(() =>
  historyOrders.value.length === 1
    ? '1 Entrega Concluída'
    : `${historyOrders.value.length} Entregas Concluídas`
);

// ── Selection & cancel ────────────────────────────────────────────────────────
const toggleSelectionMode = () => {
  isSelectionMode.value = !isSelectionMode.value;
  if (!isSelectionMode.value) selectedDeliveryIds.value = [];
};

const toggleOrderSelection = (id) => {
  if (!isSelectionMode.value) return;
  const index = selectedDeliveryIds.value.indexOf(id);
  if (index > -1) selectedDeliveryIds.value.splice(index, 1);
  else selectedDeliveryIds.value.push(id);
};

const openCancelModal = () => {
  if (selectedDeliveryIds.value.length === 0) return;
  showCancelModal.value = true;
};

const confirmCancellation = async () => {
  if (!cancelReason.value) {
    cancelError.value = 'Por favor, selecione um motivo.';
    return;
  }
  isCancelling.value = true;
  cancelError.value = '';
  try {
    // Update each selected order in Strapi
    const toCancel = pendingOrders.value.filter((o) =>
      selectedDeliveryIds.value.includes(o.id)
    );
    await Promise.all(
      toCancel.map((o) =>
        strapiPut(`/api/orders/${o.documentId}`, { order_status: 'cancelled' })
      )
    );
    // Remove from local pending list
    pendingOrders.value = pendingOrders.value.filter(
      (o) => !selectedDeliveryIds.value.includes(o.id)
    );
    showCancelModal.value = false;
    isSelectionMode.value = false;
    selectedDeliveryIds.value = [];
    cancelReason.value = '';
    alert('Entregas canceladas com sucesso.');
  } catch (err) {
    cancelError.value = err.message || 'Ocorreu um erro ao cancelar as entregas.';
  } finally {
    isCancelling.value = false;
  }
};

const showDetails = computed(() => route.path === '/deliveries-details');

watch(showSuccess, (val) => {
  document.body.classList.toggle('hide-footer', val);
}, { immediate: true });

onUnmounted(() => {
  document.body.classList.remove('hide-footer');
});

const goBackToDeliveries = () => {
  showSuccess.value = false;
  successError.value = '';
  fetchOrders(); // Refresh the list
  router.push('/deliveries');
};

const goToHistoryFromSuccess = () => {
  showSuccess.value = false;
  successError.value = '';
  activeTab.value = 'history';
  fetchOrders(); // Refresh the list
  router.push({ path: '/deliveries', query: { tab: 'history' } });
};

/**
 * Called when DeliveryDetails emits 'confirm-delivery'.
 * Captures the order's documentId/id before clearing selectedOrder,
 * then fetches the full order data from Strapi to populate the success view.
 */
const handleDeliveryConfirmed = async () => {
  // Capture the reference before clearing
  const orderRef = selectedOrder.value;
  const docId = orderRef?.documentId || orderRef?.id;
  
  // Show success page immediately with loading state
  selectedOrder.value = null;
  showSuccess.value = true;
  successLoading.value = true;
  successError.value = '';

  if (!docId) {
    successError.value = 'ID do pedido não encontrado. A entrega foi confirmada mas não foi possível carregar os detalhes.';
    successLoading.value = false;
    return;
  }

  try {
    const json = await strapiGet(`/api/orders/${docId}?populate=*`);
    const order = json.data;

    if (!order) {
      successError.value = `Pedido "${docId}" não encontrado no sistema.`;
      successLoading.value = false;
      return;
    }

    // Build the completed delivery data model
    const now = new Date();
    const client = order.client_id ?? {};
    const recipientName = client.first_name
      ? `${client.first_name} ${client.last_name ?? ''}`.trim()
      : (client.fullname ?? client.name ?? 'Destinatário desconhecido');

    // Determine if on-time: compare actual completion time with scheduled date
    const scheduledDate = order.date ? new Date(order.date) : null;
    const isOnTime = scheduledDate ? now <= scheduledDate : true;

    completedDelivery.value = {
      orderId: order.order_id || String(order.id),
      completionDate: now.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      recipientName,
      deliveryAddress: order.address || 'Morada não definida',
      completionTime: now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      isOnTime,
    };
  } catch (err) {
    console.error('[Deliveries] Error fetching completed order:', err);
    successError.value = 'Ocorreu um erro ao carregar os detalhes da entrega. Tente novamente.';
  } finally {
    successLoading.value = false;
  }
};

onMounted(async () => {
  if (route.query.tab) activeTab.value = route.query.tab;
  
  if (!courierStore.courierProfile) {
    const { auth } = await import('@backend/firebase');
    const email = auth?.currentUser?.email;
    if (email) {
      await courierStore.resolveCourierFromStrapi(email);
    }
  }

  fetchOrders();
});
</script>



<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

body {
  padding: 0 !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
}

body.hide-footer .m-bottom-nav-section {
  display: none !important;
}

body.hide-footer .main-layout-body {
  padding-bottom: 0 !important;
}

.show-desktop { display: block; }
.show-mobile  { display: none;  }

@media (max-width: 768px) {
  .show-desktop { display: none;  }
  .show-mobile  { display: block; }
}

/* ========== REFINED CONFIRMATION SECTION (DESKTOP) ========== */
.dd-confirm-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 40px;
  margin-top: 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.03);
  border: 1px solid #f8fafc;
}

.dd-confirm-label {
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 32px;
}

.dd-confirm-actions-row {
  display: flex;
  justify-content: center;
  gap: 80px;
  margin: 40px 0;
}

.dd-confirm-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.dd-confirm-item i {
  font-size: 44px;
  color: #64748b;
  transition: color 0.2s;
}

.dd-confirm-item:hover i {
  color: #ff6b35;
}



.dd-confirm-text {
  font-size: 15px;
  font-weight: 700;
  color: #64748b;
}

.dd-confirm-item:hover .dd-confirm-text {
  color: #103841;
}

.dd-confirm-notes {
  margin-top: 48px;
}

.dd-confirm-input {
  width: 100%;
  border: none;
  font-size: 14px;
  color: #94a3b8;
  outline: none;
  background: transparent;
  font-family: "Public Sans", sans-serif;
}

.dd-final-buttons {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dd-btn-main-orange {
  width: 100%;
  background: #ff6b35;
  color: white;
  border: none;
  padding: 20px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(255, 107, 53, 0.2);
  transition: all 0.2s;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.dd-btn-main-orange:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(255, 107, 53, 0.4); }

.dd-btn-sec-outline {
  width: 100%;
  background: white;
  color: #94a3b8;
  border: 1.5px solid #f1f5f9;
  padding: 16px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.dd-btn-sec-outline:hover {
  background: #f8fafc;
  color: #64748b;
  border-color: #cbd5e1;
}

/* ========== REFINED CONFIRMATION SECTION (MOBILE) ========== */
.m-confirm-card-section {
  background: transparent;
  border-radius: 0;
  padding: 48px 16px 0;
  margin: 0;
  border: none;
  box-shadow: none;
}

.m-confirm-label {
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 48px;
  display: block;
}

.m-confirm-actions-row {
  display: flex;
  justify-content: space-around;
  padding: 32px 0 56px;
  gap: 60px;
}

.m-confirm-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.m-confirm-item i {
  font-size: 40px;
  color: #64748b;
}

.m-confirm-text {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
}



.m-confirm-notes {
  margin-top: 0;
  padding: 32px 16px 0;
  border-top: none;
}

.m-confirm-input {
  width: 100%;
  border: none;
  border-radius: 0;
  font-size: 15px;
  color: #94a3b8;
  padding: 0;
  outline: none;
  background: transparent;
  font-family: "Public Sans", sans-serif;
}

.m-confirm-input::placeholder {
  color: #94a3b8;
}

.m-final-action-btns {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 56px 16px 40px;
}

.m-btn-orange-pill {
  width: 100%;
  background: #ff6b35;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 800;
  box-shadow: 0 10px 20px rgba(255, 107, 53, 0.2);
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.m-btn-outline-gray {
  width: 100%;
  background: white;
  color: #94a3b8;
  border: 1.5px solid #f1f5f9;
  padding: 12px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.m-btn-outline-gray:active { background: #f8fafc; border-color: #cbd5e1; }

/* ========== SUCCESS VIEW STYLES ========== */
.success-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 9999;
}

.success-content {
  max-width: 500px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 768px) {
  .success-content {
    max-width: 420px;
    gap: 16px;
    transform: scale(0.95);
    transform-origin: center;
  }
}

.success-icon-wrapper {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.success-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scale .3s ease-in-out .4s both;
}

.checkmark-icon {
  font-size: 52px;
  color: white;
  animation: fadeIn 0.4s ease-in-out 0.5s both;
}

@keyframes fadeIn {
  0%   { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}

.success-title {
  font-size: 32px;
  font-weight: 800;
  color: #103841;
  margin: 0;
}

.success-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 16px 0;
}

.delivery-summary-box {
  background: white !important;
  border-radius: 24px !important;
  padding: 40px !important;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.04) !important;
  text-align: left !important;
  border: 1px solid #f1f5f9 !important;
  width: 100% !important;
  box-sizing: border-box !important;
  display: block !important;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.summary-id {
  font-weight: 700;
  color: #103841;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-date {
  font-size: 13px;
  color: #94a3b8;
}

.summary-divider {
  height: 1px;
  background: #f1f5f9;
  margin-bottom: 28px;
}

.summary-body {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.summary-item {
  display: flex;
  gap: 24px;
  align-items: center;
}

.summary-item i {
  font-size: 20px;
  color: #ff6b35;
  background: rgba(255, 107, 53, 0.1);
  padding: 10px;
  border-radius: 12px;
}

.summary-info {
  display: flex;
  flex-direction: column;
}

.summary-info label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.summary-info span {
  font-size: 15px;
  font-weight: 600;
  color: #103841;
}


@media (max-width: 480px) {
  .success-title { font-size: 28px; }
  .success-page { padding: 16px; }
}

/* ========== SKELETON LOADING ELEMENTS ========== */
.skeleton-line {
  display: inline-block;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s ease-in-out infinite;
  border-radius: 6px;
}

.skeleton-circle {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  flex-shrink: 0;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s ease-in-out infinite;
}

@keyframes skeletonShimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.success-circle--loading {
  background: #94a3b8 !important;
}

/* ========== TIME BADGE (ON TIME / LATE) ========== */
.time-badge {
  font-weight: 700;
  font-size: 13px;
  margin-left: 4px;
}

.time-badge--on-time {
  color: #16a34a;
}

.time-badge--late {
  color: #dc2626;
}

/* ========== SPIN ANIMATION FOR LOADING ========== */
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}
</style>

<style scoped>
/* ========== SUCCESS PAGE BUTTONS (ONLY) ========== */
.action-buttons {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 18px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(255, 107, 53, 0.2);
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(255, 107, 53, 0.4);
}

.btn-secondary {
  background: white;
  color: #94a3b8;
  border: 1.5px solid #f1f5f9;
  padding: 14px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* ========== LIST VIEW STYLES (ORIGINAL DELIVERIES) ========== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ========== RESPONSIVE TOGGLE ========== */
.mobile-view { display: none; }

@media (max-width: 767px) {
  .desktop-view { display: none !important; }
  .mobile-view { display: flex; flex-direction: column; min-height: 100vh; background: #f9f9f9; }
}

/* ========== DESKTOP STYLES ========== */
.min-vh-100 { min-height: 100vh; }
.bg-white { background-color: white; }
.p-3 { padding: 1rem; }
.d-flex { display: flex; }
.flex-column { flex-direction: column; }





.d-cancel-btn {
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 14px 28px;
  font: 700 14px "Public Sans", sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(253, 94, 58, 0.2);
  transition: all 0.2s;
}

.d-cancel-btn:hover { background: #e94f2b; }

.d-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  grid-auto-rows: 1fr;
  padding: 1.5rem 0;
  flex: 1;
  align-content: start;
}

.d-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s;
  height: 100%;
}

.d-card.d-card-risk {
  border: 2px solid #ff6b35;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.15);
}

.d-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
}

.d-badge {
  font: 700 12px "Public Sans", sans-serif;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #dc2626;
  padding: 8px 14px;
  border-radius: 50px;
}

.d-badge.d-badge-next { background: #ff6b35; }


.d-time {
  font: 700 14px "Public Sans", sans-serif;
  color: #64748b;
}

.d-card-middle {
  padding: 20px 28px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.d-location {
  font: 700 26px "Public Sans", sans-serif;
  color: #103841;
  margin: 0;
  line-height: 32px;
}

.d-delivery-type {
  font: 700 12px "Inter", sans-serif;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.d-btn-details {
  background: #103841;
  color: white;
  border: none;
  border-radius: 0;
  padding: 18px 16px;
  margin: 0;
  font: 700 13px "Inter", sans-serif;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.4px;
  transition: background 0.2s;
}

.d-btn-details:hover { background: #0b1c30; }

.d-card.d-card-placeholder {
  border: 2px dashed #d0d0d0;
  align-items: center;
  justify-content: center;
  text-align: center;
  opacity: 0.7;
  min-height: 220px;
}

.d-placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.d-placeholder-icon {
  font-size: 36px;
  color: rgba(100, 116, 139, 0.3);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.d-placeholder-title {
  font: 700 14px "Public Sans", sans-serif;
  color: rgba(100, 116, 139, 0.5);
  margin: 0;
}

.d-placeholder-text {
  font: 400 12px "Public Sans", sans-serif;
  color: rgba(100, 116, 139, 0.4);
  max-width: 160px;
  line-height: 18px;
  margin: 0;
}

@media (max-width: 1024px) {
  .d-cards-grid { grid-template-columns: 1fr; }
}

/* ========== MOBILE STYLES ========== */
.m-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding-bottom: 100px;
}

.m-title-section {
  background: white;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.m-title-container {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.m-title {
  font: 800 24px "Inter", sans-serif;
  color: #103841;
  margin: 0;
  white-space: nowrap;
}

.m-subtitle {
  font: 500 12px "Inter", sans-serif;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
}

.m-vehicle-section {
  background: white;
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.m-vehicle-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.m-vehicle-label {
  font: 500 10px "Inter", sans-serif;
  color: #64748b;
}

.m-vehicle-name {
  font: 700 11px "Public Sans", sans-serif;
  color: #103841;
  text-transform: uppercase;
}

.m-tabs-section {
  background: white;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 54px; /* Stabilize height between tabs */
}

.m-tabs { display: flex; gap: 20px; }

.m-tab {
  background: none;
  border: none;
  padding: 0;
  font: 700 12px "Public Sans", sans-serif;
  color: #64748b;
  cursor: pointer;
  position: relative;
  border-bottom: 2px solid transparent;
}

.m-tab.active {
  color: #ff6b35;
  border-bottom-color: #ff6b35;
}

.m-cancel-btn {
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font: 700 10px "Public Sans", sans-serif;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.m-cancel-btn:active { background: #e94f2b; }

.m-cards-section {
  background: white;
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
}

.m-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.m-card.m-card-risk {
  border: 2px solid #ff6b35;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.15);
}

.m-card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.m-badge {
  width: fit-content;
  padding: 8px 14px;
  border-radius: 50px;
  font: 700 11px "Inter", sans-serif;
  text-transform: uppercase;
  color: white;
  background: #ff6b35;
}

.m-badge.m-badge-risk { background: #dc2626; }
.m-badge.m-badge-done { background: #16a34a; }

.m-card.m-card-done {
  border: 2px solid #16a34a;
  opacity: 0.85;
}



.m-time {
  font: 700 22px "Inter", sans-serif;
  color: #103841;
  line-height: 28px;
}

.m-time-risk { color: #dc2626; }

.m-location-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: #64748b;
}

.m-location-row i {
  font-size: 12px;
  margin-top: 2px;
  flex-shrink: 0;
  color: #64748b;
}

.m-location {
  font: 500 13px "Inter", sans-serif;
  color: #64748b;
  line-height: 18px;
}

.m-delivery-type {
  font: 700 10px "Inter", sans-serif;
  color: #64748b;
  text-transform: uppercase;
}

.m-btn-details {
  background: #103841;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 16px;
  font: 700 12px "Inter", sans-serif;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
  margin-top: 8px;
}

.m-btn-details:active { background: #0b1c30; }

.m-btn-details i { font-size: 10px; }



/* ========== OLD DELIVERY CARD STYLES ========== */
.delivery-cards {
  display: flex;
  flex-direction: column;
  gap: 32px;
}



.delivery-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow 0.2s;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background-color: white;
  width: 100%;
}

.delivery-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.delivery-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.delivery-badge {
  padding: 6px 16px;
  border-radius: 50px;
  font-family: 'Public Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.delivery-badge--concluida {
  background-color: #d1fae5;
  color: #1e7e34;
}

/* Tailwind-like utilities requested by user */
.bg-green-100 { background-color: #dcfce7; }
.text-green-700 { color: #15803d; }
.bg-red-100 { background-color: #fee2e2; }
.text-red-700 { color: #b91c1c; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
.skeleton-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.delivery-id {
  font-family: 'Public Sans', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #103841;
  margin-left: auto;
}

.delivery-address {
  font-family: 'Public Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #103841;
  line-height: 22px;
}

.delivery-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Public Sans', sans-serif;
  font-size: 13px;
  color: #64748b;
}

.delivery-time i {
  color: #ff6b35;
}

.delivery-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.delivery-avatar {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 107, 53, 0.1);
  border-radius: 50%;
  font-family: 'Public Sans', sans-serif;
  font-size: 10px;
  font-weight: 700;
  color: #ff6b35;
  flex-shrink: 0;
}

.delivery-details-btn {
  margin-left: auto;
  padding: 10px 24px;
  background-color: transparent;
  color: #ff6b35;
  border: 1.5px solid #ff6b35;
  border-radius: 9999px;
  font-family: 'Public Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.delivery-details-btn:hover {
  background-color: rgba(255, 107, 53, 0.1);
}

/* ================================================================
   NEW STYLES FOR HISTORY VIEW (2 COLUMNS & PERFORMANCE)
   ================================================================ */

.entregas-main {
  width: 100%;
}

.entregas-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}



.entregas-left-column {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.delivery-history-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-title {
  font-family: 'Public Sans', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #103841;
  line-height: 32px;
}

.section-subtitle {
  font-family: 'Public Sans', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #64748b;
}

.tabs-container {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0;
}

.tab-button {
  padding: 12px 0;
  margin-bottom: -1px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: 'Public Sans', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #103841;
}

.tab-button--active {
  color: #ff6b35;
  border-bottom-color: #ff6b35;
}

.entregas-right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: stretch;
}

.vehicle-info {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 14px;
  width: 100%;
  border: 1px solid #e5e7eb;
}

.vehicle-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ff6b35;
  color: white;
  border-radius: 10px;
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.vehicle-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vehicle-label {
  font-family: 'Public Sans', sans-serif;
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.vehicle-details-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.vehicle-model {
  font-family: 'Public Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #103841;
}

.vehicle-plate {
  font-family: 'Public Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

.performance-panel {
  width: 100%;
  padding: 24px;
  background-color: rgba(255, 107, 53, 0.05);
  border: 1px solid rgba(255, 107, 53, 0.2);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.performance-title {
  font-family: 'Public Sans', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #103841;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 12px;
}

.performance-metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
}

.metric-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ff6b35;
  color: white;
  border-radius: 10px;
  font-size: 22px;
  flex-shrink: 0;
  order: 3;
}

.metric-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-family: 'Public Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 2px;
}

.metric-value {
  font-family: 'Public Sans', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #103841;
}

.performance-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 14px;
  border-top: 1px solid rgba(255, 107, 53, 0.2);
  margin-top: 8px;
}

.chart-title {
  font-family: 'Public Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #103841;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  height: 180px;
}

.chart-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chart-x-labels {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.chart-x-label {
  flex: 1;
  text-align: center;
  font-family: 'Public Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-bar {
  flex: 1;
  background-color: #ff6b35;
  border-radius: 6px 6px 0 0;
  transition: opacity 0.2s ease, background-color 0.2s ease;
  min-width: 20px;
  position: relative;
  cursor: pointer;
}

.chart-bar--hovered {
  background-color: #d44e1e;
}

.chart-bar:hover {
  opacity: 1 !important;
}

.chart-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background-color: #103841;
  color: #ffffff;
  border-radius: 8px;
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
  pointer-events: none;
  animation: tooltipFadeIn 0.15s ease;
  z-index: 10;
}

.chart-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #103841;
}

.chart-tooltip-day {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-tooltip-value {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}

@keyframes tooltipFadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(4px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@media (max-width: 768px) {
  .entregas-container {
    grid-template-columns: 1fr;
  }
  .metric-value {
    font-size: 18px;
  }
  .chart-bars {
    height: 130px;
  }
  .section-title {
    font-size: 20px;
  }
}

/* ==================== CANCELLATION FEATURE STYLES ==================== */

/* Selection Mode */
.d-card--selected {
  border-color: #ff6b35 !important;
  background-color: #fffaf9 !important;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.1) !important;
}

.d-selection-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  transition: all 0.2s;
}

.d-card--selected .d-selection-checkbox {
  background: #ff6b35;
  border-color: #ff6b35;
  color: white;
}

.d-cancel-btn--confirm {
  background: #dc2626 !important;
}

.d-cancel-btn-cancel {
  background: transparent;
  border: 1.5px solid #cbd5e1;
  color: #64748b;
  border-radius: 50px;
  padding: 12px 24px;
  font: 700 13px "Public Sans", sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}

.d-cancel-btn-cancel:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

/* Modal Overlay */
.cancel-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(16, 56, 65, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

/* Modal Content */
.cancel-modal {
  background: white;
  border-radius: 32px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalScaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalScaleUp {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.cancel-modal-header {
  padding: 40px 40px 24px;
  text-align: center;
}

.cancel-icon-wrap {
  width: 64px;
  height: 64px;
  background: #fff1f2;
  color: #dc2626;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 20px;
}

.cancel-modal-title {
  font: 800 24px "Inter", sans-serif;
  color: #103841;
  margin: 0 0 12px;
}

.cancel-modal-subtitle {
  font: 400 15px "Public Sans", sans-serif;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

.cancel-modal-body {
  padding: 0 40px 32px;
}

.cancel-selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
  justify-content: center;
}

.cancel-item-pill {
  background: #f1f5f9;
  color: #103841;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #e2e8f0;
}

.cancel-reason-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
}

.cancel-label {
  display: block;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 12px;
}

.cancel-select {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font: 600 14px "Public Sans", sans-serif;
  color: #103841;
  outline: none;
  transition: border-color 0.2s;
  cursor: pointer;
}

.cancel-select:focus {
  border-color: #ff6b35;
}

.cancel-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font: 400 14px "Public Sans", sans-serif;
  color: #103841;
  outline: none;
  resize: none;
  transition: border-color 0.2s;
}

.cancel-textarea:focus {
  border-color: #ff6b35;
}

.cancel-error-msg {
  margin-top: 16px;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-modal-footer {
  padding: 0 40px 40px;
  display: flex;
  gap: 16px;
}

.cancel-btn-back {
  flex: 1;
  background: white;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
  padding: 18px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn-back:hover {
  background: #f8fafc;
  color: #103841;
  border-color: #cbd5e1;
}

.cancel-btn-confirm {
  flex: 2;
  background: #dc2626;
  color: white;
  border: none;
  padding: 18px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 8px 16px rgba(220, 38, 38, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cancel-btn-confirm:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(220, 38, 38, 0.3);
}

.cancel-btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Mobile Selection Mode */
.m-card--selected {
  border: 2px solid #ff6b35 !important;
  background-color: #fffaf9 !important;
}

.m-selection-checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  transition: all 0.2s;
}

.m-card--selected .m-selection-checkbox {
  background: #ff6b35;
  border-color: #ff6b35;
}


/* ════════════════════════════════════════════════════════════════════════════════
   DETAILS VIEW STYLES: Moved to DeliveryDetails.vue component
   ════════════════════════════════════════════════════════════════════════════════ */

/* Locked card (lower priority — EM ESPERA) */
.d-card--locked,
.m-card--locked {
  opacity: 0.55;
  filter: grayscale(40%);
  pointer-events: auto; /* keep clicks to show card but button is disabled */
}

/* EM ESPERA badge */
.d-badge-waiting,
.m-badge-waiting {
  background: #e2e8f0;
  color: #64748b;
  font-family: 'Public Sans', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 9999px;
  flex-shrink: 0;
}


</style>