import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core import mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

User = get_user_model()

@pytest.mark.django_db
class TestAuthenticationFlow:
    
    def test_registration_sends_email(self, api_client):
        """Prueba que registrarse crea el usuario inactivo y envía correo"""
        url = reverse('register') # Asegúrate que este name coincida con tu urls.py
        data = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "profession": "Dev",
            "experience": "1-2",
            "industry": "TECH"
        }
        
        response = api_client.post(url, data)
        
        assert response.status_code == 201
        assert User.objects.count() == 1
        user = User.objects.get(email="test@example.com")
        assert user.is_verified is False # Importante: Nace sin verificar
        
        # Verificar que se envió el email
        assert len(mail.outbox) == 1
        assert "Verifica tu cuenta" in mail.outbox[0].subject

    def test_verify_email_logic(self, api_client):
        """Prueba manual del endpoint de verificación"""
        # 1. Crear usuario manual
        user = User.objects.create_user(email="verify@test.com", password="pwd")
        user.is_verified = False
        user.save()

        # 2. Generar token válido (simulando lo que hace el utils.py)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # 3. Llamar al endpoint
        url = reverse('verify-email')
        response = api_client.post(url, {'uid': uid, 'token': token})

        assert response.status_code == 200
        
        user.refresh_from_db()
        assert user.is_verified is True

    def test_login_blocked_if_unverified(self, api_client):
        """El login debe fallar si is_verified es False"""
        User.objects.create_user(email="no@verify.com", password="Password123!", is_verified=False)
        
        url = reverse('token_obtain_pair')
        response = api_client.post(url, {
            "email": "no@verify.com",
            "password": "Password123!"
        })

        assert response.status_code == 401
        # Verificamos que el mensaje de error sea el personalizado
        assert "no ha sido verificada" in str(response.data)

    def test_login_success_if_verified(self, api_client):
        """El login funciona si is_verified es True"""
        User.objects.create_user(email="yes@verify.com", password="Password123!", is_verified=True)
        
        url = reverse('token_obtain_pair')
        response = api_client.post(url, {
            "email": "yes@verify.com",
            "password": "Password123!"
        })

        assert response.status_code == 200
        assert "access" in response.data
        assert "refresh" in response.data