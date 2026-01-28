import pytest
import json
from unittest.mock import patch, MagicMock
from cv_generator.services import CVGeneratorService

@pytest.mark.django_db
class TestCVGeneratorService:
    
    def test_gather_user_data_structure(self, full_user_profile):
        """
        Verifica que _gather_user_data extraiga y formatee correctamente
        toda la información de los modelos relacionales.
        """
        service = CVGeneratorService(user=full_user_profile, job_description="test")
        data = service._gather_user_data()

        # Verificaciones clave
        assert data['personal_info']['full_name'] == "Juan Perez"
        assert data['personal_info']['email'] == "test@example.com"
        assert len(data['experience']) == 1
        assert data['experience'][0]['company'] == "Tech Corp"
        assert "Python" in data['skills']
        assert len(data['projects']) == 1
        assert "Python" in data['projects'][0]['technologies']

    @patch('cv_generator.services.settings.OPENAI_API_KEY', 'sk-fake-key')
    @patch('cv_generator.services.OpenAI')
    def test_generate_cv_success_flow(self, mock_openai_class, full_user_profile):
        """
        Prueba el flujo feliz: Tenemos API Key, llamamos a OpenAI
        y recibimos un JSON válido.
        """
        # 1. Configurar el Mock de la respuesta de OpenAI
        mock_client = MagicMock()
        mock_openai_class.return_value = mock_client
        
        expected_json = {
            "job_title_target": "Senior Python Dev",
            "profile_summary": "Experto en Django",
            "selected_skills": ["Python", "Django"],
            "selected_languages": [],
            "experience": [],
            "education": [],
            "projects": [],
            "certificates": []
        }
        
        # Simulamos la estructura anidada de la respuesta de OpenAI
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = json.dumps(expected_json)
        mock_client.chat.completions.create.return_value = mock_completion

        # 2. Ejecutar servicio
        service = CVGeneratorService(user=full_user_profile, job_description="Need Python Dev")
        result = service.generate_cv()

        # 3. Asserts
        assert result == expected_json
        assert result['job_title_target'] == "Senior Python Dev"
        # Verificar que se llamó a la API con los mensajes correctos
        mock_client.chat.completions.create.assert_called_once()

    @patch('cv_generator.services.settings.OPENAI_API_KEY', None)
    def test_generate_cv_no_api_key_fallback(self, full_user_profile):
        """
        Si no hay API KEY, debe retornar el Mock interno sin romper la app.
        """
        service = CVGeneratorService(user=full_user_profile, job_description="Cualquier cosa")
        result = service.generate_cv()

        assert result['job_title_target'] == "Puesto Objetivo (Mock)"
        assert "Mock Generated" in result['experience'][0]['enhanced_description'][0]

    @patch('cv_generator.services.settings.OPENAI_API_KEY', 'sk-fake-key')
    @patch('cv_generator.services.OpenAI')
    def test_generate_cv_openai_error_handling(self, mock_openai_class, full_user_profile):
        """
        Si OpenAI falla (Timeout, 500, etc), el servicio debe capturar
        la excepción y devolver el Mock por seguridad.
        """
        mock_client = MagicMock()
        mock_openai_class.return_value = mock_client
        
        # Hacemos que la llamada explote
        mock_client.chat.completions.create.side_effect = Exception("OpenAI is down")

        service = CVGeneratorService(user=full_user_profile, job_description="Test")
        result = service.generate_cv()

        # Debe haber hecho fallback al mock
        assert result['job_title_target'] == "Puesto Objetivo (Mock)"