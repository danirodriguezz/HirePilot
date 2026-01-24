import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from accounts.models import WorkExperience, WorkAchievement

User = get_user_model()

@pytest.mark.django_db
class TestWorkExperienceFlow:

    @pytest.fixture
    def user(self):
        """Crea un usuario verificado para los tests"""
        return User.objects.create_user(
            email="dev@test.com", 
            password="password123",
            is_verified=True
        )

    @pytest.fixture
    def auth_client(self, api_client, user):
        """Autentica al cliente con el usuario creado"""
        api_client.force_authenticate(user=user)
        return api_client

    def test_create_experience_basic(self, auth_client, user):
        """Prueba crear una experiencia simple sin logros"""
        url = reverse('work-experience-list') # Nombre generado por el Router
        data = {
            "company": "Tech Corp",
            "role": "Junior Dev",
            "location": "Madrid",
            "description": "Trabajando duro",
            "start_date": "2023-01-01",
            "current_job": True
        }

        response = auth_client.post(url, data, format='json')

        assert response.status_code == 201
        assert WorkExperience.objects.count() == 1
        assert WorkExperience.objects.get().user == user

    def test_create_experience_with_achievements(self, auth_client):
        """Prueba la creación anidada (Experiencia + Logros a la vez)"""
        url = reverse('work-experience-list')
        data = {
            "company": "Big Data Inc",
            "role": "Senior Dev",
            "location": "Remote",
            "start_date": "2020-01-01",
            "end_date": "2022-01-01",
            "description": "Liderando equipo",
            "achievements": [
                {"description": "Aumenté ventas 20%"},
                {"description": "Reduje latencia 50%"}
            ]
        }

        response = auth_client.post(url, data, format='json')

        assert response.status_code == 201
        
        # Verificar que se creó la experiencia
        exp = WorkExperience.objects.get(company="Big Data Inc")
        
        # Verificar que se crearon los logros asociados
        assert exp.achievements.count() == 2
        assert exp.achievements.first().description in ["Aumenté ventas 20%", "Reduje latencia 50%"]

    def test_get_own_experience_only(self, auth_client, api_client, user):
        """Prueba que el usuario solo ve SUS experiencias y no las de otros"""
        # 1. Crear experiencia del usuario logueado
        WorkExperience.objects.create(
            user=user, 
            company="My Company", 
            role="Dev", 
            start_date="2022-01-01"
        )

        # 2. Crear experiencia de OTRO usuario
        other_user = User.objects.create_user(email="other@test.com", password="pwd")
        WorkExperience.objects.create(
            user=other_user, 
            company="Other Company", 
            role="CEO", 
            start_date="2022-01-01"
        )

        url = reverse('work-experience-list')
        response = auth_client.get(url)

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]['company'] == "My Company"

    def test_update_experience_and_replace_achievements(self, auth_client, user):
        """
        Prueba CRÍTICA: Verifica que al actualizar, se borran los logros viejos
        y se crean los nuevos (lógica definida en tu serializer).
        """
        # 1. Setup inicial
        exp = WorkExperience.objects.create(
            user=user, company="Old Corp", role="Dev", start_date="2020-01-01"
        )
        WorkAchievement.objects.create(work_experience=exp, description="Logro Viejo 1")
        WorkAchievement.objects.create(work_experience=exp, description="Logro Viejo 2")

        assert exp.achievements.count() == 2

        # 2. Actualizar (PUT)
        url = reverse('work-experience-detail', kwargs={'pk': exp.pk})
        data = {
            "company": "Updated Corp", # Cambiamos nombre
            "role": "Dev",
            "location": "Remote",
            "start_date": "2020-01-01",
            "description": "Updated desc",
            "achievements": [
                {"description": "Logro NUEVO Único"} 
                # Enviamos solo 1 nuevo, deberían borrarse los 2 viejos
            ]
        }

        response = auth_client.put(url, data, format='json')

        assert response.status_code == 200
        
        exp.refresh_from_db()
        assert exp.company == "Updated Corp"
        
        # Verificamos lógica de logros
        assert exp.achievements.count() == 1
        assert exp.achievements.first().description == "Logro NUEVO Único"

    def test_delete_experience_cascades(self, auth_client, user):
        """Prueba que al borrar experiencia, se borran los logros"""
        exp = WorkExperience.objects.create(
            user=user, company="To Delete", role="Dev", start_date="2020-01-01"
        )
        WorkAchievement.objects.create(work_experience=exp, description="Logro")

        url = reverse('work-experience-detail', kwargs={'pk': exp.pk})
        response = auth_client.delete(url)

        assert response.status_code == 204
        assert WorkExperience.objects.count() == 0
        assert WorkAchievement.objects.count() == 0 # Cascade check

    def test_create_invalid_payload(self, auth_client):
        """Prueba validaciones requeridas"""
        url = reverse('work-experience-list')
        data = {
            "role": "Dev" 
            # Falta company, start_date, etc.
        }
        response = auth_client.post(url, data)
        assert response.status_code == 400
        assert "company" in response.data