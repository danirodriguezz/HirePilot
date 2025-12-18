from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from datetime import date
from .models import (
    UserProfile, WorkExperience, WorkAchievement, 
    Education, Skill, JobPosting, TailoredCV
)

# Obtenemos el modelo de usuario activo dinámicamente
User = get_user_model()

class UserModelTest(TestCase):
    """Pruebas enfocadas en la autenticación y creación de usuarios"""

    def test_create_user_successful(self):
        """Prueba la creación exitosa de un usuario estándar"""
        email = "dev@saas.com"
        password = "securepassword123"
        user = User.objects.create_user(email=email, password=password)

        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        # Verificamos defaults
        self.assertEqual(user.plan, User.Plan.FREE)

    def test_create_superuser(self):
        """Prueba que el superusuario tenga los permisos correctos"""
        admin = User.objects.create_superuser(email="admin@saas.com", password="adminpass")
        
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_verified) # Validamos tu lógica personalizada

    def test_create_user_without_email_fails(self):
        """El email debe ser obligatorio"""
        with self.assertRaises(ValueError):
            User.objects.create_user(email=None, password="password")

    def test_duplicate_email_fails(self):
        """El email debe ser único (IntegrityError en BD)"""
        email = "unique@saas.com"
        User.objects.create_user(email=email, password="password")
        
        with self.assertRaises(IntegrityError):
            User.objects.create_user(email=email, password="password")


class UserProfileTest(TestCase):
    """Pruebas para el perfil y sus Enums"""

    def setUp(self):
        self.user = User.objects.create_user(email="profile@saas.com", password="pw")

    def test_profile_creation_and_enums(self):
        """Prueba la creación del perfil y el uso correcto de los Choices"""
        profile = UserProfile.objects.create(
            user=self.user,
            headline="Backend Ninja",
            summary="Python Lover",
            years_of_experience=UserProfile.ExperienceRange.FIVE_TO_SIX,
            industry=UserProfile.Industry.TECH,
            phone="+123456789"
        )

        # Verificamos que se guardó el valor correcto ('5-6')
        self.assertEqual(profile.years_of_experience, '5-6')
        # Verificamos que Django puede recuperar el texto legible ('Entre 5 y 6 años')
        self.assertEqual(profile.get_years_of_experience_display(), 'Entre 5 y 6 años')
        
        # Probamos el __str__
        self.assertIn("Backend Ninja", str(profile))

    def test_profile_cascade_delete(self):
        """Si borramos al usuario, el perfil debe morir (CASCADE)"""
        UserProfile.objects.create(
            user=self.user, headline="Test", summary="Test", phone="123"
        )
        self.user.delete()
        self.assertEqual(UserProfile.objects.count(), 0)


class WorkExperienceTest(TestCase):
    """Pruebas para experiencia laboral y ordenamiento"""

    def setUp(self):
        self.user = User.objects.create_user(email="worker@saas.com", password="pw")

    def test_experience_ordering(self):
        """La experiencia más reciente debe aparecer primero (Meta ordering)"""
        exp1 = WorkExperience.objects.create(
            user=self.user,
            company="Old Corp",
            role="Junior",
            start_date=date(2015, 1, 1),
            end_date=date(2018, 1, 1)
        )
        exp2 = WorkExperience.objects.create(
            user=self.user,
            company="New Startup",
            role="Senior",
            start_date=date(2020, 1, 1),
            current_job=True
        )

        experiences = WorkExperience.objects.filter(user=self.user)
        # El primero en la lista debe ser el más reciente (exp2)
        self.assertEqual(experiences.first(), exp2)
        self.assertEqual(experiences.last(), exp1)


class JSONFieldsTest(TestCase):
    """
    IMPORTANTE: Pruebas críticas para los campos JSON.
    Validamos que Postgres acepte estructuras complejas.
    """

    def setUp(self):
        self.user = User.objects.create_user(email="json@saas.com", password="pw")

    def test_achievement_keywords(self):
        """Prueba que WorkAchievement guarda una lista de keywords"""
        work = WorkExperience.objects.create(
            user=self.user, company="A", role="B", start_date=date(2022, 1, 1)
        )
        
        keywords_list = ["Python", "Django", "Optimización"]
        achievement = WorkAchievement.objects.create(
            work_experience=work,
            description="Mejoré la performance",
            keywords=keywords_list
        )

        saved_ach = WorkAchievement.objects.get(id=achievement.id)
        self.assertEqual(saved_ach.keywords, keywords_list)
        self.assertIsInstance(saved_ach.keywords, list)

    def test_job_posting_analysis(self):
        """Prueba que JobPosting guarda un diccionario de análisis"""
        analysis_mock = {
            "required_skills": ["React", "Redux"],
            "tone": "Formal",
            "match_score": 85
        }
        
        posting = JobPosting.objects.create(
            user=self.user,
            title="Frontend Dev",
            original_text="We need React...",
            analysis_result=analysis_mock
        )

        saved_posting = JobPosting.objects.get(id=posting.id)
        self.assertEqual(saved_posting.analysis_result['tone'], "Formal")


class TailoredCVSnapshotTest(TestCase):
    """
    CRÍTICO: Validar la integridad del SNAPSHOT.
    El CV generado NO debe cambiar si el usuario cambia su perfil después.
    """

    def setUp(self):
        self.user = User.objects.create_user(email="candidate@saas.com", password="pw")
        self.posting = JobPosting.objects.create(
            user=self.user, title="Dev", original_text="Desc"
        )

    def test_snapshot_immutability(self):
        # 1. Creamos un snapshot con los datos ACTUALES del usuario
        original_data = {
            "headline": "Junior Dev",
            "skills": ["HTML", "CSS"]
        }
        
        cv = TailoredCV.objects.create(
            user=self.user,
            job_posting=self.posting,
            content_snapshot=original_data
        )

        # 2. Simulamos que el usuario evoluciona y cambia su "Master Data" mañana
        # (En la realidad esto sería un update al modelo UserProfile o Skill)
        new_user_data = {
            "headline": "Senior Architect",
            "skills": ["HTML", "CSS", "Docker", "Kubernetes"]
        }

        # 3. Verificamos que el CV guardado SIGUE teniendo los datos viejos
        # Esto asegura la integridad histórica del documento PDF generado
        self.assertEqual(cv.content_snapshot['headline'], "Junior Dev")
        self.assertNotEqual(cv.content_snapshot['headline'], new_user_data['headline'])