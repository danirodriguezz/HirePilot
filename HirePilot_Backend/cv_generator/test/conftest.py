# cv_generator/tests/conftest.py
import pytest
from django.utils import timezone
from django.contrib.auth import get_user_model
from accounts.models import UserProfile, WorkExperience, Education, Skill, Project, Language

User = get_user_model()

@pytest.fixture
def full_user_profile(db):
    """
    Crea un usuario y actualiza su perfil (generado por signals)
    para probar el _gather_user_data exhaustivamente.
    """
    # 1. Usuario Base (Esto dispara la señal post_save que crea el perfil vacío)
    user = User.objects.create_user(
        email="test@example.com", 
        password="password123", 
        first_name="Juan", 
        last_name="Perez"
    )
    
    # 2. Perfil: NO usamos create, recuperamos el que creó la señal y lo actualizamos
    # Usamos update_or_create por seguridad, por si la señal no existiera en el futuro.
    UserProfile.objects.update_or_create(
        user=user,
        defaults={
            "phone": "+123456789",
            "linkedin_url": "https://linkedin.com/in/juanperez",
            "summary": "Senior Developer"
        }
    )

    # 3. Experiencia
    WorkExperience.objects.create(
        user=user,
        company="Tech Corp",
        role="Backend Dev",
        start_date=timezone.now().date(),
        description="Developed APIs"
    )

    # 4. Educación
    Education.objects.create(
        user=user,
        institution="University X",
        degree="BSc CS",
        field_of_study="Computer Science",
        start_date=timezone.now().date()
    )

    # 5. Skills
    Skill.objects.create(user=user, name="Python")
    Skill.objects.create(user=user, name="Django")

    # 6. Proyectos
    proj = Project.objects.create(
        user=user,
        title="HirePilot",
        role="Lead",
        description="SaaS App"
    )
    # Nota: Asegúrate de que la lógica de skills del proyecto coincida con tu modelo
    try:
        skill_py = Skill.objects.get(name="Python", user=user)
        proj.skills.add(skill_py)
    except:
        pass # Manejo simple por si cambia la lógica de skills

    return user