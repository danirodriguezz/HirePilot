# 🚀 HirePilot

HirePilot es una aplicación web SaaS diseñada para revolucionar la forma en que los candidatos aplican a ofertas de trabajo. Permite a los usuarios generar currículums (CVs) en formato PDF altamente optimizados y adaptados estratégicamente a descripciones de ofertas de empleo (Job Descriptions), garantizando una **política estricta de cero alucinaciones** (cero datos inventados).

## 📖 Tabla de Contenidos
- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Vista Previa y Demo](#vista-previa-y-demo)
- [Requisitos Previos](#requisitos-previos)
- [Variables de Entorno (.env)](#variables-de-entorno-env)
- [Instalación y Despliegue Local](#instalación-y-despliegue-local)
- [Estructura del Proyecto](#estructura-del-proyecto)

## ✨ Características Principales
* **Master Data del Perfil:** Almacenamiento exhaustivo de la experiencia laboral, educación, habilidades y proyectos del usuario.
* **Smart Matching:** Análisis semántico (mediante IA) de descripciones de ofertas de trabajo para extraer *keywords* y requisitos clave.
* **Cero Alucinaciones:** Algoritmo que reordena, resalta y reformula la experiencia real del usuario sin inventar absolutamente nada.
* **Generación de PDF:** Renderizado en tiempo real de un CV limpio y profesional listo para descargar.
* **Protección de Datos:** Arquitectura pensada para proteger la PII (Personal Identifiable Information) de los usuarios.

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

## 📸 Vista Previa y Demo


### Dashboard y Landingpage Principal (Tamaño de Ordenador)
![Mockup Landingpage](.github/assets/mockups_ordenador/Captura%20desde%202026-02-19%2012-35-57.png)

![Mockup Dashboard](.github/assets/mockups_ordenador/Captura%20desde%202026-02-19%2012-40-30.png)


### Dashboard y Landingpage Principal (Tamaño de movil)

![Mockup Landingpage](.github/assets/mockups_movil/Captura%20desde%202026-02-19%2012-42-44.png)


![Mockup Dashboard](.github/assets/mockups_movil/Captura%20desde%202026-03-07%2022-16-12.png)


### 🎥 Demo en Video
[![Ver Demo en Video](https://img.youtube.com/vi/ry-FJfT5_B4/0.jpg)](https://www.youtube.com/watch?v=ry-FJfT5_B4)


---

## 🛠️ Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu entorno local:
* [Node.js](https://nodejs.org/) (v18 o superior)
* [Python](https://www.python.org/) (v3.10 o superior)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Para levantar la base de datos)
* Git

---

## 🔐 Variables de Entorno (.env)

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
# ANTHROPIC_API_KEY=tu_anthropic_api_key


```

En la carpeta HirePilot_fronted/, crea un archivo .env con:


```env
VITE_API_URL=http://localhost:8000/api
```

## 🚀 Instalación y Despliegue Local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina.

### 1. Clonar el repositorio

``` bash
git clone [https://github.com/TU_USUARIO/hirepilot.git](https://github.com/TU_USUARIO/hirepilot.git)
cd hirepilot
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
El frontend estará disponible en http://localhost:5173.
```


## 📁 Estructura del Proyecto
```Plaintext
hirepilot/
├── docker-compose.yml       # Configuración de PostgreSQL en Docker
├── HirePilot_Backend/       # Código fuente del servidor Django / API REST
│   ├── accounts/            # App de gestión de usuarios y perfiles
│   ├── cv_generator/        # App core para la lógica de IA y matching
│   ├── server/              # Configuración principal de Django
│   ├── manage.py
│   └── requirements.txt     # Dependencias de Python
└── HirePilot_fronted/       # Código fuente del cliente React
    ├── public/              # Assets estáticos y plantillas
    ├── src/                 # Código fuente
    │   ├── api/             # Configuración de Axios
    │   ├── components/      # Componentes UI reutilizables
    │   ├── pages/           # Vistas principales (Auth, Dashboard, etc.)
    │   └── services/        # Lógica de llamadas a la API
    └── package.json         # Dependencias de Node
```