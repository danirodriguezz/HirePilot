import pytest
from django.urls import reverse  # <--- IMPORTANTE
from rest_framework import status
from cv_generator.models import CVGeneration
from django.test import override_settings

@pytest.mark.django_db
class TestGenerateCVView:

    # Usamos reverse para obtener la URL real dinámicamente
    # 'generate-cv' es el name='...' que pusiste en cv_generator/urls.py
    def get_url(self):
        return reverse('generate-cv') 

    def test_generate_cv_unauthorized(self, api_client):
        """Un usuario anónimo no debe poder generar CVs."""
        data = {"job_description": "Some job"}
        # Usamos self.get_url() en lugar del string hardcodeado
        response = api_client.post(self.get_url(), data) 
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_generate_cv_validation_error(self, api_client, full_user_profile):
        """Debe fallar si no se envía job_description."""
        api_client.force_authenticate(user=full_user_profile)
        response = api_client.post(self.get_url(), {}) 
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "job_description" in response.data

    @override_settings(OPENAI_API_KEY='sk-fake-key-for-testing')
    def test_generate_cv_success_integration(self, api_client, full_user_profile):
        api_client.force_authenticate(user=full_user_profile)
        
        payload = {
            "job_description": "We need a Python Expert with Django experience."
        }
        
        response = api_client.post(self.get_url(), payload)
        
        # 1. Verificar respuesta HTTP
        assert response.status_code == status.HTTP_201_CREATED
        assert "id" in response.data
        assert "structured_cv_data" in response.data
        
        # 2. Verificar Persistencia en BD
        cv_obj = CVGeneration.objects.get(id=response.data['id'])
        assert cv_obj.user == full_user_profile
        assert cv_obj.job_description == payload['job_description']