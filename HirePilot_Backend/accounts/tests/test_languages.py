import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from accounts.models import Language

User = get_user_model()

@pytest.mark.django_db
class TestLanguageFlow:

    @pytest.fixture
    def user(self):
        """Crea un usuario verificado para los tests"""
        return User.objects.create_user(
            email="polyglot@test.com", 
            password="password123",
            is_verified=True
        )

    @pytest.fixture
    def auth_client(self, api_client, user):
        """Autentica al cliente con el usuario creado"""
        api_client.force_authenticate(user=user)
        return api_client

    def test_create_language_full(self, auth_client, user):
        """Prueba crear un idioma con certificado"""
        url = reverse('languages-list') # Nombre generado por el Router
        data = {
            "language": "English",
            "level": "C2",
            "certificate": "Cambridge Proficiency (CPE)"
        }

        response = auth_client.post(url, data, format='json')

        assert response.status_code == 201
        assert Language.objects.count() == 1
        
        lang = Language.objects.get()
        assert lang.user == user
        assert lang.language == "English"
        assert lang.certificate == "Cambridge Proficiency (CPE)"

    def test_create_language_minimal(self, auth_client):
        """Prueba crear solo con los campos obligatorios"""
        url = reverse('languages-list')
        data = {
            "language": "Spanish",
            "level": "Native"
            # Sin certificado
        }

        response = auth_client.post(url, data, format='json')

        assert response.status_code == 201
        lang = Language.objects.get()
        assert lang.language == "Spanish"
        assert lang.certificate is None

    def test_get_own_languages_only(self, auth_client, user):
        """Seguridad: El usuario solo ve SUS idiomas"""
        # 1. Idioma del usuario logueado
        Language.objects.create(
            user=user, 
            language="French", 
            level="B2"
        )

        # 2. Idioma de OTRO usuario
        other_user = User.objects.create_user(email="other@test.com", password="pwd")
        Language.objects.create(
            user=other_user, 
            language="German", 
            level="A1"
        )

        url = reverse('languages-list')
        response = auth_client.get(url)

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]['language'] == "French"

    def test_update_language(self, auth_client, user):
        """Prueba actualizar el nivel o añadir certificado"""
        lang = Language.objects.create(
            user=user, 
            language="Italian", 
            level="A1"
        )

        url = reverse('languages-detail', kwargs={'pk': lang.pk})
        data = {
            "language": "Italian",
            "level": "B1", # Mejoró el nivel
            "certificate": "PLIDA B1"
        }

        response = auth_client.put(url, data, format='json')

        assert response.status_code == 200
        
        lang.refresh_from_db()
        assert lang.level == "B1"
        assert lang.certificate == "PLIDA B1"

    def test_delete_language(self, auth_client, user):
        """Prueba borrar un idioma"""
        lang = Language.objects.create(
            user=user, language="Japanese", level="N5"
        )

        url = reverse('languages-detail', kwargs={'pk': lang.pk})
        response = auth_client.delete(url)

        assert response.status_code == 204
        assert Language.objects.count() == 0

    def test_ordering(self, auth_client, user):
        """Verifica que los idiomas se ordenan alfabéticamente (definido en Meta)"""
        Language.objects.create(user=user, language="English", level="C1")
        Language.objects.create(user=user, language="Chinese", level="A1")
        Language.objects.create(user=user, language="Spanish", level="Native")

        url = reverse('languages-list')
        response = auth_client.get(url)

        assert len(response.data) == 3
        # 'Chinese' debería ser el primero alfabéticamente
        assert response.data[0]['language'] == "Chinese"
        # 'Spanish' el último
        assert response.data[2]['language'] == "Spanish"

    def test_validation_required_fields(self, auth_client):
        """Debe fallar si falta el idioma o el nivel"""
        url = reverse('languages-list')
        data = {
            "certificate": "TOEFL" 
            # Faltan language y level
        }
        response = auth_client.post(url, data)
        assert response.status_code == 400
        assert "language" in response.data
        assert "level" in response.data