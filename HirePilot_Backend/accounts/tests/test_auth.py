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
        # Cambia 'register' por el nombre exacto que tengas en tu urls.py si es diferente
        url = reverse('register') 
        data = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "profession": "Dev",
            "experience": "1-2",
            "industry": "TECH",
            "plan": "BASIC" # Añadido por si tu serializador lo requiere
        }
        
        response = api_client.post(url, data)
        
        assert response.status_code == 201
        assert User.objects.count() == 1
        user = User.objects.get(email="test@example.com")
        assert user.is_verified is False # Importante: Nace sin verificar
        
        # Verificar que se envió el email
        assert len(mail.outbox) == 1
        # Verifica que parte del asunto o cuerpo coincida
        # (Ajusta este string según el Asunto real que envíe tu función send_verification_email)
        assert len(mail.outbox[0].subject) > 0 

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
        url = reverse('verify-email') # Asegúrate del name en urls.py
        response = api_client.post(url, {'uid': uid, 'token': token})

        assert response.status_code == 200
        
        user.refresh_from_db()
        assert user.is_verified is True

    def test_login_blocked_if_unverified(self, api_client):
        """El login debe fallar si is_verified es False"""
        User.objects.create_user(email="no@verify.com", password="Password123!", is_verified=False)
        
        # Asumiendo que 'token_obtain_pair' es el nombre de tu vista CustomTokenObtainPairView
        url = reverse('token_obtain_pair') 
        response = api_client.post(url, {
            "email": "no@verify.com",
            "password": "Password123!"
        })

        assert response.status_code == 401
        # Ajusta este string al mensaje exacto que devuelve tu serializador personalizado
        assert "no ha sido verificada" in str(response.data)

    def test_login_success_and_secure_cookie(self, api_client):
        """
        El login funciona si is_verified es True y 
        devuelve la cookie segura en lugar del token en el JSON.
        """
        User.objects.create_user(email="yes@verify.com", password="Password123!", is_verified=True)
        
        url = reverse('token_obtain_pair')
        response = api_client.post(url, {
            "email": "yes@verify.com",
            "password": "Password123!"
        })

        # 1. El login es correcto
        assert response.status_code == 200
        
        # 2. Tenemos el access_token en el cuerpo
        assert "access" in response.data
        
        # 3. 🚨 PROTECCIÓN XSS: El refresh_token NO debe estar en el cuerpo JSON
        assert "refresh" not in response.data
        
        # 4. 🚨 PROTECCIÓN XSS y CSRF: El refresh_token debe estar en las cookies
        assert "refresh_token" in response.cookies
        
        cookie = response.cookies["refresh_token"]
        assert cookie["httponly"] is True
        assert cookie["samesite"] == "Lax"

    def test_token_refresh_via_cookie(self, api_client):
        """
        Prueba que el endpoint de refresh lee correctamente la cookie 
        (que el cliente guarda automáticamente tras el login) y devuelve un nuevo access_token.
        """
        # 1. Creamos usuario verificado
        User.objects.create_user(email="refresh@test.com", password="Password123!", is_verified=True)
        
        # 2. Hacemos login. El api_client guardará internamente la cookie recibida.
        login_url = reverse('token_obtain_pair')
        api_client.post(login_url, {
            "email": "refresh@test.com",
            "password": "Password123!"
        })

        # 3. Llamamos al endpoint de refresh sin enviar datos en el body,
        # la cookie 'refresh_token' viaja sola en las cabeceras de la petición.
        refresh_url = reverse('token_refresh') # Ajusta al nombre real de tu url
        response = api_client.post(refresh_url, {})

        # Si tu CustomTokenRefreshView inyecta correctamente la cookie en request.data,
        # esto devolverá 200 y un nuevo token de acceso.
        assert response.status_code == 200
        assert "access" in response.data