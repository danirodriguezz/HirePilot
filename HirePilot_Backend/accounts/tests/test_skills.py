import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from accounts.models import Skill

User = get_user_model()

@pytest.mark.django_db
class TestSkillFlow:

    @pytest.fixture
    def user(self):
        """Crea un usuario verificado para los tests"""
        return User.objects.create_user(
            email="talented@test.com", 
            password="password123",
            is_verified=True
        )

    @pytest.fixture
    def auth_client(self, api_client, user):
        """Autentica al cliente con el usuario creado"""
        api_client.force_authenticate(user=user)
        return api_client

    def test_create_technical_skill(self, auth_client, user):
        """Prueba crear una habilidad TÉCNICA"""
        url = reverse('skills-list') # Nombre generado por el Router
        data = {
            "name": "Python",
            "skill_type": "TECHNICAL",
            "level": "EXPERT"
        }

        response = auth_client.post(url, data, format='json')

        assert response.status_code == 201
        assert Skill.objects.count() == 1
        
        skill = Skill.objects.get()
        assert skill.user == user
        assert skill.name == "Python"
        assert skill.skill_type == "TECHNICAL"

    def test_create_soft_skill(self, auth_client):
        """Prueba crear una habilidad BLANDA"""
        url = reverse('skills-list')
        data = {
            "name": "Liderazgo",
            "skill_type": "SOFT",
            "level": "ADVANCED"
        }

        response = auth_client.post(url, data, format='json')

        assert response.status_code == 201
        skill = Skill.objects.get()
        assert skill.name == "Liderazgo"
        assert skill.skill_type == "SOFT"

    def test_get_own_skills_only(self, auth_client, user):
        """Seguridad: El usuario solo ve SUS habilidades"""
        # 1. Habilidad del usuario logueado
        Skill.objects.create(
            user=user, 
            name="Django", 
            skill_type="TECHNICAL"
        )

        # 2. Habilidad de OTRO usuario
        other_user = User.objects.create_user(email="other@test.com", password="pwd")
        Skill.objects.create(
            user=other_user, 
            name="Flask", 
            skill_type="TECHNICAL"
        )

        url = reverse('skills-list')
        response = auth_client.get(url)

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]['name'] == "Django"

    def test_update_skill_level(self, auth_client, user):
        """Prueba actualizar el nivel de una habilidad"""
        skill = Skill.objects.create(
            user=user, 
            name="React", 
            skill_type="TECHNICAL",
            level="BEGINNER"
        )

        url = reverse('skills-detail', kwargs={'pk': skill.pk})
        data = {
            "name": "React",
            "skill_type": "TECHNICAL",
            "level": "ADVANCED" # Subimos de nivel
        }

        response = auth_client.put(url, data, format='json')

        assert response.status_code == 200
        
        skill.refresh_from_db()
        assert skill.level == "ADVANCED"

    def test_delete_skill(self, auth_client, user):
        """Prueba borrar una habilidad"""
        skill = Skill.objects.create(
            user=user, name="Photoshop", skill_type="TECHNICAL"
        )

        url = reverse('skills-detail', kwargs={'pk': skill.pk})
        response = auth_client.delete(url)

        assert response.status_code == 204
        assert Skill.objects.count() == 0

    def test_default_values(self, auth_client):
        """Prueba que si no enviamos nivel, usa el por defecto (INTERMEDIATE)"""
        url = reverse('skills-list')
        data = {
            "name": "Teamwork",
            "skill_type": "SOFT"
            # No enviamos 'level'
        }

        response = auth_client.post(url, data, format='json')
        assert response.status_code == 201
        
        skill = Skill.objects.get()
        assert skill.level == "INTERMEDIATE" # Valor default definido en models.py

    def test_validation_choices(self, auth_client):
        """Debe fallar si enviamos un tipo de habilidad inválido"""
        url = reverse('skills-list')
        data = {
            "name": "Magic",
            "skill_type": "INVALID_TYPE", # Tipo no existente
            "level": "BEGINNER"
        }
        response = auth_client.post(url, data, format='json')
        assert response.status_code == 400
        assert "skill_type" in response.data