# 🌱 Plants vs Zombies API Almanac 🧟

Aplicación web desarrollada con **Angular 20** que consume la **API de Plants vs Zombies 2**. Permite explorar plantas y zombies mediante listados, buscadores, filtros y vistas de detalle, aplicando buenas prácticas modernas de Angular.

---

## Descripción general

La aplicación está dividida en dos secciones principales: **Plantas** y **Zombies**. En ambas se pueden visualizar listados en forma de **grid de cards**, realizar búsquedas por nombre y acceder a vistas de detalle.

La navegación se realiza mediante **Angular Routing tradicional i rutas parametrizadas**.

---

## Tecnologías utilizadas

- **HTML5**
- **CSS3**
- **Tailwind CSS**
- **Angular 20**
- **TypeScript**

---

## Arquitectura y enfoque técnico

- Aplicación desarrollada **sin Zone.js (Zoneless)**
- **Change Detection Strategy: OnPush**
- Uso del **patrón MVC**
- Routing tradicional de Angular

Este enfoque permite una aplicación más **performante**, **predecible** y **fácil de mantener**.

---

## Sección Plantas

### Funcionalidades

- Visualización de todas las plantas en un **grid de cards**
- **Buscador por nombre**
- Filtros por:
  - Coste de soles
  - Familia
- Acceso al **detalle de cada planta** al hacer click en una card

### Detalle de planta

La vista de detalle muestra la información completa de la planta obtenida desde la API.

---

## Sección Zombies

### Funcionalidades

- Visualización de zombies en un **grid de cards**
- **Buscador por nombre**
- Filtros desplegables por:
  - Dureza
  - Velocidad
  - Stamina
- Acceso al **detalle de cada zombie**

### Detalle de zombie

- Vista con información detallada del zombie
- Posibilidad de **navegar entre los detalles de los distintos zombies**

---

## 🌐 API utilizada

La aplicación consume datos de la siguiente API:

👉 **Plants vs Zombies 2 API**  
https://pvz-2-api.vercel.app/docs
