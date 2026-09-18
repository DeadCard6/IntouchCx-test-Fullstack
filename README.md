# Sistema de Reserva y Compra de Vuelos (IntouchCX Test)

Aplicacion web Full-Stack para la consulta de vuelos (horarios, tarifas y estado), gestion de reservas de pasajeros, y simulacion de compra de billetes aereos con confirmacion por correo y temporizador de inactividad de 15 minutos.

---

## Arquitectura del Proyecto

El proyecto sigue una **Arquitectura en Capas desacoplada (Layered Clean Architecture)** que promueve la separacion de responsabilidades, alta cohesion y bajo acoplamiento:

```text
IntouchCx-test-Fullstack/
├── backend/                   # API REST en Node.js + Express + TypeScript
│   ├── prisma/                # Esquema de base de datos relacional (SQLite) y Seeders
│   ├── tests/                 # Suite de pruebas automatizadas (Vitest + Supertest)
│   └── src/
│       ├── config/            # Configuracion de variables de entorno y base de datos
│       ├── controllers/       # Manejadores de solicitudes HTTP (req/res)
│       ├── middlewares/       # Autenticacion JWT, control de inactividad, validaciones Zod
│       ├── models/            # Tipos y esquemas de dominio
│       ├── repositories/      # Capa de acceso a datos y abstraccion de Prisma
│       ├── routes/            # Definicion y agrupamiento de rutas API REST
│       ├── services/          # Logica central del negocio y casos de uso
│       ├── types/             # DTOs y tipos globales de TypeScript
│       ├── utils/             # Utilidades de seguridad (hashing), tokens y formato
│       └── app.ts / server.ts # Configuracion de Express y servidor
│
└── frontend/                  # SPA interactiva en React + Vite + TypeScript
    └── src/
        ├── assets/            # Recursos estaticos e imagenes
        ├── components/        # Componentes UI reutilizables (Navbar, Cards, Modales, Timer)
        ├── context/           # Manejo de estado global (Auth, Booking, Theme)
        ├── hooks/             # Custom hooks (Inactividad 15m, Busqueda, Vuelos)
        ├── pages/             # Vistas principales (Inicio, Busqueda, Reserva, Checkout, Perfil)
        ├── services/          # Cliente HTTP para comunicacion con la API
        ├── styles/            # Sistema de diseno moderno, temas y animaciones
        └── types/             # Modelos de datos del frontend
```

---

## Stack Tecnologico

- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM, SQLite, bcryptjs, jsonwebtoken, zod, cors, Vitest, Supertest.
- **Frontend:** React 18, TypeScript, Vite, React Router DOM, Lucide Icons, Modern CSS Design System.
- **Control de Versiones:** Git con estandar **Conventional Commits**.

---

## Requisitos y Ejecucion Rapida

### Requisitos Previos:
- [Node.js](https://nodejs.org/) (version 18.x o superior)
- `npm` o `yarn`

### Instalacion:
```bash
# Instalar dependencias en raiz, backend y frontend
npm run install:all
```

### Inicializacion de Base de Datos:
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

---

## Ejecutar Pruebas Automatizadas

```bash
cd backend
npm test
```
