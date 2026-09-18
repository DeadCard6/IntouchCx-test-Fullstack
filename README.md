# Sistema de Reserva y Compra de Vuelos (IntouchCX Test)

Aplicación web Full-Stack para la consulta de vuelos (horarios, tarifas y estado), gestión de reservas de pasajeros, y simulación de compra de billetes aéreos con confirmación por correo y temporizador de inactividad de 15 minutos.

---

## 🏛️ Arquitectura del Proyecto

El proyecto sigue una **Arquitectura en Capas desacoplada (Layered Clean Architecture)** que promueve la separación de responsabilidades, alta cohesión y bajo acoplamiento:

```text
IntouchCx-test-Fullstack/
├── backend/                   # API REST en Node.js + Express + TypeScript
│   ├── prisma/                # Esquema de base de datos relacional (SQLite) y Seeders
│   └── src/
│       ├── config/            # Configuración de variables de entorno y base de datos
│       ├── controllers/       # Manejadores de solicitudes HTTP (req/res)
│       ├── middlewares/       # Autenticación JWT, control de inactividad, validaciones Zod
│       ├── models/            # Tipos y esquemas de dominio
│       ├── repositories/      # Capa de acceso a datos y abstracción de Prisma
│       ├── routes/            # Definición y agrupamiento de rutas API REST
│       ├── services/          # Lógica central del negocio y casos de uso
│       ├── types/             # DTOs y tipos globales de TypeScript
│       ├── utils/             # Utilidades de seguridad (hashing), tokens y formato
│       └── app.ts / server.ts # Configuración de Express y servidor
│
└── frontend/                  # SPA interactiva en React + Vite + TypeScript
    └── src/
        ├── assets/            # Recursos estáticos e imágenes
        ├── components/        # Componentes UI reutilizables (Navbar, Cards, Modales, Timer)
        ├── context/           # Manejo de estado global (Auth, Booking, Theme)
        ├── hooks/             # Custom hooks (Inactividad 15m, Búsqueda, Vuelos)
        ├── pages/             # Vistas principales (Inicio, Búsqueda, Reserva, Checkout, Perfil)
        ├── services/          # Cliente HTTP para comunicación con la API
        ├── styles/            # Sistema de diseño moderno, temas y animaciones
        └── types/             # Modelos de datos del frontend
```

---

## 🛠️ Stack Tecnológico

- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM, SQLite, bcryptjs, jsonwebtoken, zod, cors.
- **Frontend:** React 18 / 19, TypeScript, Vite, React Router DOM, Lucide Icons, Modern CSS Design System.
- **Control de Versiones:** Git con estándar **Conventional Commits**.

---

## 🚀 Requisitos y Ejecución Rápida

### Requisitos Previos:
- [Node.js](https://nodejs.org/) (versión 18.x o superior)
- `npm` o `yarn`

### Instalación:
```bash
# Instalar dependencias en raíz, backend y frontend
npm run install:all
```

### Inicialización de Base de Datos:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Ejecutar en Desarrollo:
```bash
# Ejecuta backend y frontend concurrentemente
npm run dev
```

- **Backend API:** `http://localhost:4000`
- **Frontend App:** `http://localhost:5173`
