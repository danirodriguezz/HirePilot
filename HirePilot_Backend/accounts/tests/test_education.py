import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from accounts.models import Education

User = get_user_model()

@pytest.mark.django_db
class TestEducationFlow:

    @pytest.fixture
    def user(self):
        """Crea un usuario verificado para los tests"""
        return User.objects.create_user(
            email="student@test.com", 
            password="password123",
            is_verified=True
        )

    @pytest.fixture
    def auth_client(self, api_client, user):
        """Autentica al cliente con el usuario creado"""
        api_client.force_authenticate(user=user)
        return api_client

    def test_create_education_full_payload(self, auth_client, user):
        """Prueba crear una educación con TODOS los campos nuevos"""
        url = reverse('education-list') # Nombre generado por el Router (basename='education')
        data = {
            "institution": "MIT",
            "degree": "Master of Science",
            "field_of_study": "Computer Science",
            "start_date": "2022-09-01",
            "end_date": "2024-06-01",
            "current": False,
            "grade": "4.0/4.0", # Probamos el campo de nota
            "description": "Specialized in AI"
        }

        response = auth_client.post(url, data, format='json')

        assert response.status_code == 201
        assert Education.objects.count() == 1
        
        edu = Education.objects.get()
        assert edu.user == user
        assert edu.institution == "MIT"
        assert edu.grade == "4.0/4.0"
        assert edu.field_of_study == "Computer Science"

    def test_create_education_minimal(self, auth_client):
        """Prueba crear con solo lo obligatorio (institución y título)"""
        url = reverse('education-list')
        data = {
            "institution": "Local Bootcamp",
            "degree": "Full Stack Dev"
            # Sin fechas, sin nota, etc.
        }

        response = auth_client.post(url, data, format='json')

        assert response.status_code == 201
        edu = Education.objects.get()
        assert edu.degree == "Full Stack Dev"
        assert edu.current is False # Valor por defecto

    def test_get_own_education_only(self, auth_client, user):
        """Seguridad: El usuario solo ve SU educación"""
        # 1. Educación del usuario logueado
        Education.objects.create(
            user=user, 
            institution="My Uni", 
            degree="B.Sc.", 
            start_date="2020-01-01"
        )

        # 2. Educación de OTRO usuario
        other_user = User.objects.create_user(email="other@test.com", password="pwd")
        Education.objects.create(
            user=other_user, 
            institution="Other Uni", 
            degree="PhD", 
            start_date="2020-01-01"
        )

        url = reverse('education-list')
        response = auth_client.get(url)

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]['institution'] == "My Uni"

    def test_update_education(self, auth_client, user):
        """Prueba actualizar datos (ej: añadir nota final o cambiar estado)"""
        edu = Education.objects.create(
            user=user, 
            institution="College", 
            degree="Associate", 
            current=True
        )

        url = reverse('education-detail', kwargs={'pk': edu.pk})
        data = {
            "institution": "College",
            "degree": "Associate",
            "current": False, # Ya terminó
            "end_date": "2023-12-01",
            "grade": "Honors"
        }

        response = auth_client.put(url, data, format='json')

        assert response.status_code == 200
        
        edu.refresh_from_db()
        assert edu.current is False
        assert edu.grade == "Honors"

    def test_delete_education(self, auth_client, user):
        """Prueba borrar un registro educativo"""
        edu = Education.objects.create(
            user=user, institution="To Delete", degree="B.A."
        )

        url = reverse('education-detail', kwargs={'pk': edu.pk})
        response = auth_client.delete(url)

        assert response.status_code == 204
        assert Education.objects.count() == 0

    def test_ordering(self, auth_client, user):
        """Verifica que devuelve los estudios ordenados por fecha (más reciente primero)"""
        # 2010 (Viejo)
        Education.objects.create(user=user, institution="High School", degree="HS", start_date="2010-01-01")
        # 2020 (Nuevo)
        Education.objects.create(user=user, institution="University", degree="M.Sc.", start_date="2020-01-01")

        url = reverse('education-list')
        response = auth_client.get(url)

        assert len(response.data) == 2
        # El primero en la lista debería ser el de 2020 (University)
        assert response.data[0]['institution'] == "University"

    def test_validation_required_fields(self, auth_client):
        """Debe fallar si falta la institución o el título"""
        url = reverse('education-list')
        data = {
            "field_of_study": "Biology" 
            # Falta institution y degree
        }
        response = auth_client.post(url, data)
        assert response.status_code == 400
        assert "institution" in response.data
        assert "degree" in response.data