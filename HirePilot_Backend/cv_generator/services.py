import json
import logging
from django.conf import settings
from openai import OpenAI
import unicodedata  
from accounts.models import UserProfile, WorkExperience, Education, Skill, Project, Language, Certificate

logger = logging.getLogger(__name__)

class CVGeneratorService:
    def __init__(self, user, job_description):
        self.user = user
        self.job_description = job_description

        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENAI_API_KEY
        )

    def generate_cv(self):
        """
        Orquestador principal.
        Combina la inteligencia de la IA con la veracidad de la Base de Datos.
        """
        # 1. Recopilar datos maestros (Master Data) de la DB
        user_data = self._gather_user_data()

        # 2. Obtener contenido generado (Ya sea Mock o AI)
        ai_generated_content = {}

        if not settings.OPENAI_API_KEY:
            logger.warning("OPENAI_API_KEY no encontrada. Usando modo MOCK.")
            ai_generated_content = self._mock_ai_logic(user_data)
        else:
            try:
                ai_generated_content = self._call_openai(user_data)
            except Exception as e:
                error_msg = str(e).encode('ascii', 'replace').decode('ascii')
                logger.error(f"Error llamando a OpenAI: {error_msg}")
                ai_generated_content = self._mock_ai_logic(user_data)

        # 3. MERGE FINAL (ESTRATEGIA HÍBRIDA)
        # Inyectamos los datos personales VERIFICADOS de la DB en la respuesta final.
        # Esto asegura que el nombre, email y teléfono nunca sean alucinados por la IA.
        final_response = {
            "profile": user_data["personal_info"],  # Datos estáticos (DB)
            **ai_generated_content                  # Datos dinámicos (IA)
        }
        
        return final_response

    def _call_openai(self, user_data):
        """
        Envía los datos a OpenAI y espera un JSON estructurado.
        """

        # 1. Limpieza de caracteres "peligrosos" o no imprimibles
        clean_job_description = self._sanitize_text(self.job_description)

        system_prompt = """
        Eres un experto reclutador de TI y especialista en redacción de CVs optimizados para ATS.
        
        TU MISIÓN: 
        Tienes la "Base de Datos Maestra" de un candidato (toda su historia) y una "Oferta de Trabajo" específica.
        Debes CONSTRUIR el contenido para un CV perfecto seleccionando y adaptando SOLO la información relevante.

        REGLAS DE ORO (FILTRADO Y ADAPTACIÓN):
        1. **Job Title Target:** Extrae el nombre exacto del puesto de la oferta.
        2. **Profile Summary:** Escribe un resumen profesional potente (3-4 líneas) que conecte la experiencia del candidato con los requisitos de la oferta.
        3. **Skills:** De la lista del candidato, SELECCIONA solo las que sean relevantes para esta oferta. Ordenalas por prioridad.
        4. **Experiencia:** - SELECCIONA las experiencias relevantes. Si una experiencia antigua no aporta valor, descártala.
           - REESCRIBE la descripción (`enhanced_description`) usando bullet points con verbos de acción.
           - ENFATIZA logros que coincidan con las palabras clave de la oferta.
        5. **Proyectos:** Elige solo aquellos proyectos que demuestren habilidades requeridas en la oferta.
        6. **Educación y Certificados:** Prioriza los relacionados con el puesto o tecnología.
        7. **Idiomas:** Inclúyelos estandarizados.

        SALIDA JSON OBLIGATORIA:
        Debes responder EXCLUSIVAMENTE con un JSON válido siguiendo esta estructura exacta:
        {
            "job_title_target": "String",
            "profile_summary": "String",
            "selected_skills": ["Skill 1", "Skill 2", "Skill 3"],
            "selected_languages": [{"name": "String", "level": "String"}],
            "experience": [
                {
                    "company": "String (Igual al input)",
                    "position": "String (Igual al input)",
                    "date_range": "YYYY-MM-DD - YYYY-MM-DD",
                    "location": "String",
                    "enhanced_description": [
                        "Bullet point de acción potente alineado a la oferta",
                        "Logro cuantificable (si es posible)"
                    ]
                }
            ],
            "education": [
                {
                    "institution": "String",
                    "degree": "String",
                    "date_range": "String"
                }
            ],
            "projects": [
                {
                    "title": "String",
                    "role": "String",
                    "description": "Breve descripción adaptada a la oferta",
                    "tech_stack": ["Tech1", "Tech2"]
                }
            ],
            "certificates": [
                {"name": "String", "issuer": "String", "date": "String"}
            ]
        }
        """

        # Filtramos datos sensibles antes de enviarlos a la IA (Privacidad)
        # La IA no necesita saber el teléfono o email para optimizar el texto
        safe_user_data = {k: v for k, v in user_data.items() if k != 'personal_info'}

        user_message = f"""
        PERFIL CANDIDATO:
        {json.dumps(safe_user_data, default=str, ensure_ascii=False)}

        OFERTA DE TRABAJO:
        {clean_job_description}
        """

        completion = self.client.chat.completions.create(
            model=settings.AI_MODEL,
            # Headers requeridos/recomendados por OpenRouter para rankings
            extra_headers={
                "HTTP-Referer": "http://localhost:8000", # Pon la URL de tu app (o localhost en dev)
                "X-Title": "HirePilot",            # El nombre de tu App
            },
            response_format={"type": "json_object"}, # FUERZA LA SALIDA JSON
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.5
        )

        # Parseamos la respuesta de texto a Diccionario Python
        content = completion.choices[0].message.content
        return json.loads(content)

    def _sanitize_text(self, text):
        """
        Normaliza el texto para eliminar caracteres de control extraños 
        que a veces vienen de copiar/pegar de PDFs, pero MANTIENE los acentos.
        """
        if not text: return ""
        # Normaliza unicode (NFC es estándar para web)
        return unicodedata.normalize('NFC', text)

    def _gather_user_data(self):
        """
        Extrae datos y convierte fechas a String (YYYY-MM-DD)
        """
        profile = UserProfile.objects.filter(user=self.user).first()
        
        # --- EXPERIENCIA ---
        experiences = []
        for exp in WorkExperience.objects.filter(user=self.user):
            experiences.append({
                "company": exp.company,
                "role": exp.role,
                "start_date": exp.start_date.strftime('%Y-%m-%d') if exp.start_date else None,
                "end_date": exp.end_date.strftime('%Y-%m-%d') if exp.end_date else None,
                "current_job": exp.current_job,
                "description": exp.description,
                "location": exp.location
            })

        # --- EDUCACIÓN ---
        educations = []
        for edu in Education.objects.filter(user=self.user):
            educations.append({
                "institution": edu.institution,
                "degree": edu.degree,
                "field_of_study": edu.field_of_study,
                "start_date": edu.start_date.strftime('%Y-%m-%d') if edu.start_date else None,
                "end_date": edu.end_date.strftime('%Y-%m-%d') if edu.end_date else None,
                "current": edu.current
            })

        # --- PROYECTOS ---
        projects = []
        for proj in Project.objects.filter(user=self.user):
            tech_stack = [skill.name for skill in proj.skills.all()]
            projects.append({
                "title": proj.title,
                "role": proj.role,
                "description": proj.description,
                "technologies": tech_stack,
                "link": proj.project_url or proj.resource_url or ""
            })

        # --- SKILLS ---
        skills = list(Skill.objects.filter(user=self.user).values_list('name', flat=True))

        # --- IDIOMAS (Nuevo) ---
        languages = []
        for lang in Language.objects.filter(user=self.user):
            languages.append({
                "name": lang.language,
                "proficiency": lang.level or "",
                "certificate_by": lang.certificate  or "" 
            })

        # --- CERTIFICADOS (Nuevo) ---
        certificates = []
        if 'Certificate' in globals(): 
            for cert in Certificate.objects.filter(user=self.user):
                certificates.append({
                    "name": cert.name,
                    "issuer": cert.issuing_organization,
                    "date": cert.issue_date.strftime('%Y-%m-%d') if cert.issue_date else None,
                    "description": cert.description or ""
                })

        return {
            "personal_info": {
                "firstName": self.user.first_name,
                "lastName": self.user.last_name,
                "profession": profile.headline if profile else "",
                "email": self.user.email,
                "phone": profile.phone if profile else "",
                "linkedin": profile.linkedin_url if profile else "",
                "website": profile.personal_website if profile else "",
            },
            "experience": experiences,
            "education": educations,
            "skills": skills,
            "projects": projects,
            "languages": languages,
            "certificates": certificates
        }

    def _mock_ai_logic(self, user_data):
        # MANTENEMOS ESTO COMO RESPALDO (FALLBACK)
        selected_skills = user_data['skills'][:5] if user_data['skills'] else []
        
        processed_experience = []
        for exp in user_data['experience']:
            processed_experience.append({
                "company": exp['company'],
                "position": exp['role'],
                "date_range": f"{exp['start_date']} - ...",
                "location": exp['location'],
                "enhanced_description": [
                    f"Gestión experta en {exp['company']} (Mock Generated).",
                    f"Logro destacado relacionado con la oferta."
                ]
            })

        return {
            "job_title_target": "Puesto Objetivo (Mock)",
            "profile_summary": "Resumen generado automáticamente por el sistema de respaldo.",
            "selected_skills": selected_skills,
            "selected_languages": user_data.get('languages', []),
            "experience": processed_experience,
            "education": user_data['education'], 
            "projects": user_data['projects'],
            "certificates": user_data.get('certificates', [])
        }