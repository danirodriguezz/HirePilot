import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from django.urls import reverse

User = get_user_model()


@pytest.mark.django_db
class TestAuthenticationFlow:
    def test_registration_creates_verified_user(self, api_client):
        """Prueba que registrarse crea el usuario directamente verificado (Hackathon mode) y sin correo"""
        url = reverse('register')
        data = {
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'test@example.com',
            'password': 'Password123!',
            'confirm_password': 'Password123!',
            'profession': 'Dev',
            'experience': '1-2',
            'industry': 'TECH',
            'plan': 'BASIC',
        }

        response = api_client.post(url, data)

        assert response.status_code == 201
        assert User.objects.count() == 1
        user = User.objects.get(email='test@example.com')
        
        # NUEVO: Comprobamos que nace verificado directamente
        assert user.is_verified is True

        # NUEVO: Verificar que NO se ha enviado ningún email de verificación
        assert len(mail.outbox) == 0

    # ⚠️ ELIMINADO: test_verify_email_logic ya no es necesario

    def test_login_blocked_if_unverified(self, api_client):
        """El login debe fallar si is_verified es False (por si algún admin lo deshabilita manualmente)"""
        # Aunque por defecto sean True, seguimos probando que la seguridad del login exista
        User.objects.create_user(email='no@verify.com', password='Password123!', is_verified=False)

        url = reverse('token_obtain_pair')
        response = api_client.post(url, {'email': 'no@verify.com', 'password': 'Password123!'})

        assert response.status_code == 401
        assert 'no ha sido verificada' in str(response.data)

    def test_login_success_and_secure_cookie(self, api_client):
        """
        El login funciona si is_verified es True y
        devuelve la cookie segura en lugar del token en el JSON.
        """
        User.objects.create_user(email='yes@verify.com', password='Password123!', is_verified=True)

        url = reverse('token_obtain_pair')
        response = api_client.post(url, {'email': 'yes@verify.com', 'password': 'Password123!'})

        # 1. El login es correcto
        assert response.status_code == 200

        # 2. Tenemos el access_token en el cuerpo
        assert 'access' in response.data

        # 3. 🚨 PROTECCIÓN XSS: El refresh_token NO debe estar en el cuerpo JSON
        assert 'refresh' not in response.data

        # 4. 🚨 PROTECCIÓN XSS y CSRF: El refresh_token debe estar en las cookies
        assert 'refresh_token' in response.cookies

        cookie = response.cookies['refresh_token']
        assert cookie['httponly'] is True
        assert cookie['samesite'] == 'Lax'

    def test_token_refresh_via_cookie(self, api_client):
        """
        Prueba que el endpoint de refresh lee correctamente la cookie
        (que el cliente guarda automáticamente tras el login) y devuelve un nuevo access_token.
        """
        # 1. Creamos usuario verificado
        User.objects.create_user(
            email='refresh@test.com', password='Password123!', is_verified=True
        )

        # 2. Hacemos login. El api_client guardará internamente la cookie recibida.
        login_url = reverse('token_obtain_pair')
        api_client.post(login_url, {'email': 'refresh@test.com', 'password': 'Password123!'})

        # 3. Llamamos al endpoint de refresh sin enviar datos en el body,
        # la cookie 'refresh_token' viaja sola en las cabeceras de la petición.
        refresh_url = reverse('token_refresh')  
        response = api_client.post(refresh_url, {})

        assert response.status_code == 200
        assert 'access' in response.data