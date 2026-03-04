from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from datetime import date
from accounts.models import (
    UserProfile, WorkExperience, WorkAchievement
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
        self.assertTrue(admin.is_verified) 

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
        """Prueba que podemos editar el perfil autocreado y usar los Choices."""
        profile = self.user.profile 

        profile.headline = "Backend Ninja"
        profile.summary = "Python Lover"
        profile.years_of_experience = UserProfile.ExperienceRange.FIVE_TO_SIX
        profile.industry = UserProfile.Industry.TECH
        profile.phone = "+123456789"
        profile.save()

        profile.refresh_from_db()

        self.assertEqual(profile.years_of_experience, '5-6')
        self.assertEqual(profile.get_years_of_experience_display(), 'Entre 5 y 6 años')
        self.assertIn("Backend Ninja", str(profile))

    def test_profile_cascade_delete(self):
        """Si borramos al usuario, el perfil debe morir (CASCADE)"""
        self.assertTrue(UserProfile.objects.filter(user=self.user).exists())
        self.user.delete()
        self.assertEqual(UserProfile.objects.count(), 0)


class WorkExperienceTest(TestCase):
    """Pruebas para experiencia laboral, ordenamiento y logros"""

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
        self.assertEqual(experiences.first(), exp2)
        self.assertEqual(experiences.last(), exp1)

    def test_achievement_keywords_json(self):
        """Prueba que WorkAchievement guarda correctamente la lista JSON de keywords"""
        work = WorkExperience.objects.create(
            user=self.user, company="Tech AI", role="Dev", start_date=date(2022, 1, 1)
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