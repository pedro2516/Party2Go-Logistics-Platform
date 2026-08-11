# Party2Go Frontoffice

Vue 3 + Vite website for Party2Go with Bootstrap 5 responsive design.

## Tech Stack

- **Vue 3** with `<script setup>` syntax
- **Vite** for fast development and optimized builds
- **Bootstrap 5** (v5.3.8) for responsive UI components
- **Vue Router** v4 for client-side routing
- **Pinia** v2 for state management

## Features

- Bootstrap 5 utility classes for responsive design
- Modular Vue 3 components with scoped CSS
- Component-based architecture (SignIn view composed of 4 sub-components)
- Vue Router integration with SignIn on root path (/)
- Vite path alias support (@/ → ./src)
- Global CSS variables for theming

## Project Setup

### Install dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Runs on [http://localhost:5175](http://localhost:5175)

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Component Architecture

### SignIn View

The SignIn view is modularized into 4 focused sub-components:

```
views/SignIn.vue (Composition parent)
├── components/SignInLogo.vue      (Logo display)
├── components/SignInHeader.vue    (Red header with icon)
├── components/SignInForm.vue      (Form fields + submit)
└── components/SignInFooter.vue    (Login link)
```

**Data Flow:** Form submission via emits from child components to parent

### Styling

- Global styles in `src/assets/style.css`
- Component-scoped styles in each `.vue` file
- Bootstrap 5 utility classes for layout and spacing
- CSS variables for colors and typography

## Available Ports

- **Frontoffice:** http://localhost:5175
- **Backoffice:** http://localhost:5174
- **PWA:** http://localhost:5173
