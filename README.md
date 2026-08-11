# Party2Go — Plataforma de Gestão Logística de Eventos

Trabalho prático desenvolvido para a unidade curricular de **Programação para a Web (PW)**.

_Nota: Este repositório é uma cópia para fins de portfólio pessoal._

## Descrição

O **Party2Go** é uma plataforma digital integrada para a organização e gestão logística de eventos infantis. O sistema resolve a fragmentação na procura e contratação de serviços de festas (como insufláveis, catering e animação), permitindo comparar e encomendar produtos de múltiplos fornecedores de forma centralizada, ao mesmo tempo que assegura a monitorização em tempo real de todas as entregas.

## Autores

- Sérgio Paulo Vieira Carvalho [@serginho355](https://github.com/serginho355)
- Pedro Manuel Mendes Neves [@pedro2516](https://github.com/pedro2516)
- Filipa Mendes de Castro Pinto [@filipamcp](https://github.com/filipamcp)
- Rodrigo Santiago Faria Fonseca Abreu [@rodrigoo-abreu](https://github.com/rodrigoo-abreu)
- Afonso Martim Carvalho Leite [@afonsooleite](https://github.com/afonsooleite)

## Arquitetura

O projeto está estruturado no formato de monorepo, composto por quatro serviços independentes e um módulo de código partilhado:

| Componente     | Tecnologia / Porta          | Descrição                                                                                                            |
| -------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `backend/`     | **Strapi v5** + **Node.js** | API REST e servidor WebSocket. Gere a base de dados, lógica de negócio e eventos em tempo real.                      |
| `frontoffice/` | **Vue.js 3** (Porta 5175)   | Portal público do cliente para exploração de catálogo, composição de _packs_, checkout e tracking de encomendas.     |
| `backoffice/`  | **Vue.js 3** (Porta 5174)   | Dashboard administrativo para gestão da frota, atribuição de entregas, monitorização de KPIs e visualização no mapa. |
| `pwa/`         | **Vue.js 3** (Porta 5173)   | Aplicação Web Progressiva para estafetas com navegação de rotas, suporte offline e recolha de prova de entrega.      |
| `shared/`      | **Vue 3** + **Pinia**       | Módulo de código reutilizável entre frontends (componentes, composables de tracking e stores).                       |

## Funcionalidades Principais

- **Tracking em Tempo Real:** Acompanhamento instantâneo da localização das entregas via Socket.io e Mapbox.
- **Múltiplos Perfis de Acesso:** Controlo de acessos com permissões granulares gerido via Firebase Auth.
- **Criação de Packs Customizados:** Carrinho de compras flexível que permite a composição de pacotes de festa personalizados.
- **Gestão de Frota e Logística:** Dashboard de administração com mapa global interativo e KPIs em tempo real.
- **Progressive Web App (PWA):** Aplicação dedicada a estafetas com cálculo de rota otimizada e recolha de prova de entrega (foto/assinatura).
- **Comunicação Bidirecional:** Canal de chat em tempo real entre clientes, estafetas e administradores.

## Perfis de Acesso

| Role         | Aplicação   | Permissões Principais                                                                   |
| ------------ | ----------- | --------------------------------------------------------------------------------------- |
| **admin**    | Backoffice  | Gestão de frota, atribuição de entregas, monitorização de KPIs e mapa global.           |
| **estafeta** | PWA         | Consulta de entregas diárias, navegação de rotas, chat e submissão de prova de entrega. |
| **business** | Frontoffice | Encomendas em nome empresarial, área de cliente dedicada e acompanhamento específico.   |
| **client**   | Frontoffice | Criação de _packs_ personalizados, checkout, tracking individual e chat com estafeta.   |

> _Nota:_ O redirecionamento pós-login é processado dinamicamente por regras no Firestore (`getRedirectPath`), que encaminham o utilizador para a aplicação e rota correspondentes.

## Principais Content-Types (API)

O backend expõe 11 domínios via REST API do Strapi, com destaque para:

| Content-Type           | Descrição                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `order`                | Entidade central da encomenda (`pending` → `aceite` → `transito` → `concluida`), histórico de localização e associações. |
| `product`              | Produtos individuais do catálogo (insufláveis, catering, animação).                                                      |
| `combo`                | Pacotes pré-configurados de produtos.                                                                                    |
| `courier`              | Registo dos estafetas, estado de atividade e localização em tempo real.                                                  |
| `client`               | Perfis de clientes particulares e empresariais.                                                                          |
| `message`              | Histórico de mensagens de chat em tempo real.                                                                            |
| `delivery-proof`       | Registo de provas de entrega (fotografia e assinatura).                                                                  |
| `vehicle-id`           | Tipos e especificações da frota de veículos.                                                                             |
| `password-reset-token` | Tokens customizados com expiração para recuperação de credenciais.                                                       |

Exemplo de acesso: `GET /api/products?populate=*`

## Tecnologias Principais

**Backend:**

- Node.js (v20+)
- Strapi v5 (API REST & CMS)
- PostgreSQL (Base de dados primária)
- Socket.io (WebSockets para tempo real)
- Firebase Admin SDK (Autenticação)
- Nodemailer

**Frontend (Frontoffice, Backoffice, PWA):**

- Vue.js 3 (Composition API)
- Vite (Build tool)
- Vue Router
- Pinia (Gestão de estado)
- Bootstrap 5 & Bootstrap Icons
- Socket.io Client
- Mapbox GL / Leaflet (Mapas e Geocoding)
- Firebase Auth

## Instruções de Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) v20 a v24
- [PostgreSQL](https://www.postgresql.org/) 14+ (ou usar SQLite localmente)
- Conta [Firebase](https://firebase.google.com/) configurada (Auth + Firestore)
- Token de acesso [Mapbox](https://www.mapbox.com/)

### Passos de Instalação

1. **Clonar o repositório:**

   ```bash
   git clone <repo-url>
   cd Party2Go-Logistics-Platform
   ```

2. **Iniciar o Backend:**

   ```bash
   cd backend
   npm install
   # Criar o ficheiro .env com as variáveis de ambiente (DATABASE, FIREBASE, MAPBOX)
   npm run dev
   # O backend ficará disponível em http://localhost:1337
   ```

3. **Iniciar o Frontoffice (Portal do Cliente):**
   Num novo terminal:

   ```bash
   cd frontoffice
   npm install
   npm run dev
   # Disponível em http://localhost:5175
   ```

4. **Iniciar o Backoffice (Admin Dashboard):**
   Num novo terminal:

   ```bash
   cd backoffice
   npm install
   npm run dev
   # Disponível em http://localhost:5174
   ```

5. **Iniciar a PWA (App Estafetas):**
   Num novo terminal:
   ```bash
   cd pwa
   npm install
   npm run dev
   # Disponível em http://localhost:5173
   ```
   > São necessários **4 terminais** em simultâneo (backend + 3 frontends), já que o projeto ainda não usa `concurrently` nem workspaces.
