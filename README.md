<div align="center">

# 🚀 HirePilot

**Generador de CVs estratégicos impulsado por IA con política estricta de cero alucinaciones.**

[![Participante - Hackatón CubePath 2026](https://img.shields.io/badge/Participante-Hackat%C3%B3n%20CubePath%202026-00C853?style=for-the-badge&logo=cloud&logoColor=white)](https://github.com/midudev/hackaton-cubepath-2026)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Django 5](https://img.shields.io/badge/Django_5-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)

[🌍 Ver Demo en Vivo en CubePath](https://hirepilot.dev/) · [🎥 Ver Video Demo](https://www.youtube.com/watch?v=ry-FJfT5_B4)

</div>

---

## Descripcion del Proyecto

HirePilot es una innovadora plataforma web SaaS diseñada para revolucionar la forma en que los candidatos aplican a ofertas de empleo, resolviendo el tedioso proceso de adaptar manualmente el currículum para cada vacante. Desarrollado orgullosamente para la Hackatón CubePath 2026 y alojado íntegramente en su infraestructura.

A través de un motor de Smart Matching integrado en nuestro backend (Django), la aplicación permite a los usuarios centralizar todo su historial profesional (Master Data). Al introducir la descripción de una oferta de trabajo (Job Description), HirePilot analiza semánticamente los requisitos y genera en tiempo real un CV en formato PDF (renderizado en React) con un diseño limpio y profesional.

---

## 📖 Tabla de Contenidos
- [☁️ Despliegue en CubePath (Hackatón)](#️-despliegue-en-cubepath-hackatón)
- [✨ Características Principales](#-características-principales)
- [📸 Vista Previa y Demo](#-vista-previa-y-demo)
- [💻 Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [⚙️ Instalación y Despliegue Local](#️-instalación-y-despliegue-local)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)

---

## ☁️ Despliegue en CubePath (Hackatón)

Para cumplir con los requisitos del desafío y garantizar una alta disponibilidad, la infraestructura de HirePilot ha sido desplegada íntegramente utilizando los servidores de **CubePath**:

* **Backend (Django + DRF):** Desplegado en una instancia de CubePath utilizando un contenedor Docker para aislar el entorno de Python y gestionar de forma segura las variables de entorno (API Keys de OpenAI/Anthropic).
* **Base de Datos:** Se ha levantado una instancia de PostgreSQL conectada de forma privada a nuestro backend dentro de la red de CubePath.
* **Frontend (React + Vite):** Compilado y servido de manera estática a través de CubePath, asegurando tiempos de carga ultra rápidos para la generación de PDFs en el cliente.

---

## ✨ Características Principales

* **Master Data del Perfil:** Almacenamiento exhaustivo de la experiencia laboral, educación, habilidades y proyectos del usuario.
* **Smart Matching:** Análisis semántico (mediante IA) de descripciones de ofertas de trabajo para extraer *keywords* y requisitos clave.
* **Cero Alucinaciones (Core Feature):** Algoritmo que reordena, resalta y reformula la experiencia real del usuario sin inventar absolutamente nada.
* **Generación de PDF:** Renderizado en tiempo real de un CV limpio y profesional listo para descargar gracias a `@react-pdf/renderer`.
* **Protección de Datos:** Arquitectura pensada para proteger la PII (Personal Identifiable Information) de los usuarios.

---


## 📸 Vista Previa y Demo


### Dashboard y Landingpage Principal (Tamaño de Ordenador)
![Mockup Landingpage](.github/assets/mockups_ordenador/mockup1.png)

![Mockup Dashboard](.github/assets/mockups_ordenador/mockup2.png)



### Dashboard y Landingpage Principal (Tamaño de móvil)

<p align="center">
  <img src=".github/assets/mockups_movil/mockup3.png" alt="Mockup Landingpage"/>
</p>

### 🎥 Demo en Video

<p align="center">
  <a href="https://www.youtube.com/watch?v=ry-FJfT5_B4" target="_blank">
    <img src="https://img.youtube.com/vi/ry-FJfT5_B4/maxresdefault.jpg" alt="Ver Demo en Video" width="80%" />
  </a>
</p>

---

## 💻 Tecnologías Utilizadas

Este proyecto sigue una arquitectura cliente-servidor moderna:

**Frontend:**
* [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
* [Tailwind CSS v4](https://tailwindcss.com/) para estilos rápidos y responsivos.
* [@react-pdf/renderer](https://react-pdf.org/) para la generación de PDFs en el cliente.
* [Axios](https://axios-http.com/) para el consumo de la API.
* React Router DOM para enrutamiento.

**Backend:**
* [Django 5.2.5](https://www.djangoproject.com/) + [Django REST Framework (DRF)](https://www.django-rest-framework.org/).
* Autenticación basada en JWT (`djangorestframework-simplejwt`).
* Integración con LLMs (OpenAI/Anthropic) para el procesamiento de lenguaje natural.

**Base de Datos e Infraestructura:**
* [PostgreSQL 15](https://www.postgresql.org/)
* [Docker & Docker Compose](https://www.docker.com/) para la contenedorización de la base de datos.

--- 

## ⚙️ Instalación y Despliegue Local

### 🛠️ Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu entorno local:
* [Node.js](https://nodejs.org/) (v18 o superior)
* [Python](https://www.python.org/) (v3.10 o superior)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Para levantar la base de datos)
* Git


### 🔐 Variables de Entorno (.env)

Antes de levantar el proyecto, necesitas configurar las variables de entorno. 

**En la carpeta `HirePilot_Backend/`**, crea un archivo `.env` con el siguiente contenido (ajusta los valores según tus credenciales):

```env
# Configuración de Django
SECRET_KEY=tu_secret_key_super_segura
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Configuración de Base de Datos (PostgreSQL en Docker)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=cv_generator_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# API Keys para IA (Reemplazar con tus claves reales)
OPENAI_API_KEY=tu_openai_api_key
AI_MODEL=tu_modelo_de_open_router
```

En la carpeta HirePilot_fronted/, crea un archivo .env con:


```env
VITE_API_URL=http://localhost:8000/api
```

### 🚀 Levantar el proyecto local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina.

### 1. Clonar el repositorio

``` bash
git clone https://github.com/danirodriguezz/HirePilot.git
cd HirePilot
```

### 2. Levantar la Base de Datos (PostgreSQL)

Utilizamos Docker Compose para facilitar la configuración de la base de datos.

```bash
docker-compose up -d
```

Esto levantará un contenedor llamado `cv_generator_db_container` con PostgreSQL corriendo en el puerto `5432`.


### 3. Configuración del Backend (Django)

Abre una terminal y dirígete a la carpeta del backend:

```bash
cd HirePilot_Backend
```

Crea y activa un entorno virtual:

``` bash
# En Windows:
python -m venv venv
venv\Scripts\activate

# En macOS/Linux:
python3 -m venv venv
source venv/bin/activate
```

Instala las dependencias:

``` bash
pip install -r requirements.txt
```

Aplica las migraciones a la base de datos:

```bash
python manage.py migrate
```

Crea un superusuario (para acceder al panel de admin de Django):

``` bash
python manage.py createsuperuser
```

Levanta el servidor de desarrollo:

``` bash
python manage.py runserver
```

El backend estará disponible en `http://localhost:8000`.


### 4. Configuración del Frontend (React/Vite)

Abre una nueva pestaña en tu terminal y dirígete a la carpeta del frontend:

```Bash
cd HirePilot_fronted
Instala las dependencias de NPM:
```
```Bash
npm install
Levanta el servidor de desarrollo:
```
```Bash
npm run dev
```

El frontend estará disponible en http://localhost:5173.



## 📁 Estructura del Proyecto

```text
HirePilot/
├── .github/                 # Archivos específicos de GitHub.
│   └── assets/              # Mockups y capturas de pantalla de la app (móvil y ordenador).
│
├── HirePilot_Backend/       # Código fuente del backend (Python / Django).
│   ├── accounts/            # Gestión de usuarios y perfiles profesionales (Master Data).
│   │   ├── migrations/      # Historial de cambios en la base de datos.
│   │   ├── tests/           # Pruebas automatizadas modulares (auth, education, skills, etc.).
│   │   ├── models.py        # Modelos de datos: CustomUser, Education, Experience, Skills, Projects.
│   │   ├── serializers.py   # Reglas de conversión entre la BBDD y el formato JSON.
│   │   ├── signals.py       # Eventos disparadores de Django (ej. acciones post-registro).
│   │   ├── utils.py         # Funciones auxiliares y utilidades de la aplicación.
│   │   └── views.py         # Endpoints de la API REST para gestionar perfiles.
│   │
│   ├── cv_generator/        # Core lógico: Generación de CVs con IA ("Zero Hallucination").
│   │   ├── test/            # Pruebas automatizadas de los servicios de IA y generación.
│   │   ├── serializers.py   # Validación de datos de entrada para la creación de CVs.
│   │   ├── services.py      # Lógica central del negocio (Integración con LLMs y matching).
│   │   ├── urls.py          # Rutas específicas para los endpoints de generación.
│   │   └── views.py         # Controladores para recibir peticiones de currículums.
│   │
│   ├── server/              # Configuración global del proyecto Django.
│   │   ├── asgi.py / wsgi.py# Puntos de entrada para el servidor web en producción.
│   │   ├── settings.py      # Configuraciones generales (BBDD, JWT, CORS, apps instaladas).
│   │   └── urls.py          # Enrutador principal de todas las URLs del backend.
│   │
│   ├── conftest.py          # Configuración compartida para las pruebas con Pytest.
│   ├── manage.py            # CLI principal de Django para ejecutar comandos.
│   ├── pyproject.toml       # Configuración moderna de herramientas de Python.
│   ├── pytest.ini           # Configuración de entorno para Pytest.
│   └── requirements.txt     # Listado de dependencias y librerías necesarias.
│
├── HirePilot_fronted/       # Código fuente del frontend (React 19 + Vite).
│   ├── public/              # Archivos estáticos servidos directamente.
│   │   ├── templates/       # Previsualizaciones de plantillas de CV (Classic, Creative, Modern).
│   │   └── hirepilotLogo.svg# Logotipo principal de la aplicación.
│   │
│   ├── src/                 # Código fuente principal de la aplicación React.
│   │   ├── api/             # Configuración HTTP (instancia de Axios e interceptores).
│   │   ├── assets/          # Recursos estáticos locales (Fuentes tipográficas y SVGs).
│   │   ├── components/      # UI reutilizable de la aplicación.
│   │   │   ├── dashboard/   # Formularios y listas del panel (Educación, Experiencia, Certificados...).
│   │   │   ├── pdf/         # Componentes encargados de renderizar visualmente el CV (React-PDF).
│   │   │   ├── ui/          # Elementos genéricos base (Modales de confirmación, DatePickers).
│   │   │   └── *.jsx        # Componentes de la Landing Page (Hero, Pricing, Features, CTA).
│   │   ├── data/            # Datos estáticos locales (Testimonios de la Landing).
│   │   ├── hooks/           # Custom hooks (ej. `useDebounce` para optimizar peticiones).
│   │   ├── pages/           # Vistas completas y enrutables.
│   │   │   ├── Auth/        # Flujos de acceso (Login, Registro, Verificación, Password).
│   │   │   ├── Dashboard/   # Panel de control protegido.
│   │   │   └── Legal/       # Páginas de Privacidad, Términos y Disclaimer del Hackatón.
│   │   ├── routes/          # Definición de rutas protegidas y públicas (React Router).
│   │   ├── services/        # Funciones abstractas para llamadas a la API (perfil, cv, lenguajes...).
│   │   ├── index.css        # Estilos globales integrados con Tailwind CSS v4.
│   │   └── main.jsx         # Punto de montaje principal de React.
│   │
│   ├── eslint.config.js     # Configuración de reglas de estilo y linting de código JS/JSX.
│   ├── nixpacks.toml        # Archivo de configuración de despliegue nativo (ideal para CubePath).
│   ├── package.json         # Metadatos del proyecto y dependencias de NPM.
│   └── vite.config.js       # Configuración del empaquetador y servidor de desarrollo Vite.
│
├── docker-compose.yml       # Orquestación de infraestructura local. Levanta la BBDD PostgreSQL.
└── README.md                # Documentación principal del proyecto.