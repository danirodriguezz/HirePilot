import pytest
from django.urls import reverse
from rest_framework import status
from django.test import override_settings


@pytest.mark.django_db
class TestGenerateCVView:


    def get_url(self):
        return reverse('generate-cv') 

    def test_generate_cv_unauthorized(self, api_client):
        """Un usuario anónimo no debe poder generar CVs."""
        data = {"job_description": "Some job"}
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
        """Prueba que el CV se genera y se devuelve al frontend sin guardarse en BD."""
        api_client.force_authenticate(user=full_user_profile)
        
        payload = {
            "job_description": "We need a Python Expert with Django experience."
        }
        
        response = api_client.post(self.get_url(), payload)
        
        # 1. Verificar respuesta HTTP (Cambiado a 200 OK)
        assert response.status_code == status.HTTP_200_OK
        
        # 2. Verificar que el JSON de respuesta contenga los datos esperados
        # Eliminamos la aserción de "id" porque ya no hay registro en BD
        assert "structured_cv_data" in response.data
        
        # Opcional: Puedes verificar que los datos estructurados no estén vacíos
        assert response.data["structured_cv_data"] is not None