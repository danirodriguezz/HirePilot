# apps/users/tests.py

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from accounts.models import UserProfile

User = get_user_model()

class ProfileUpdateTests(APITestCase):
    def setUp(self):
        # 1. Crear un usuario de prueba (La Signal crea el perfil automáticamente)
        self.user = User.objects.create_user(
            email='test@example.com', 
            password='password123',
            first_name='OriginalName',
            last_name='OriginalLast'
        )
        self.user.is_verified = True # Importante si usas validación de email
        self.user.save()

        # 2. Configurar datos iniciales del perfil
        self.profile = self.user.profile
        self.profile.headline = "Original Headline"
        self.profile.save()

        # 3. Autenticar al cliente para las peticiones
        self.client.force_authenticate(user=self.user)
        
        # URL del endpoint (ajusta el nombre según tu urls.py, asumo 'user-me' o similar)
        # Si no usas nombres en urls, pon la ruta directa: '/api/me/'
        self.url = '/api/me/' 

    def test_update_nested_profile_success(self):
        """
        Prueba que se pueden actualizar campos del Usuario (first_name) 
        y del Perfil (website) en la misma petición PATCH.
        """
        payload = {
            "first_name": "Daniel",
            "last_name": "Updated",
            "profile": {
                "headline": "Senior Developer",
                "personal_website": "https://midominio.com",
                "phone": "666777888"
            }
        }

        response = self.client.patch(self.url, payload, format='json')

        # 1. Verificar respuesta HTTP
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 2. Refrescar datos de la base de datos
        self.user.refresh_from_db()
        self.profile.refresh_from_db()

        # 3. Verificar cambios en Tabla USER
        self.assertEqual(self.user.first_name, "Daniel")
        self.assertEqual(self.user.last_name, "Updated")

        # 4. Verificar cambios en Tabla PROFILE (Nested)
        self.assertEqual(self.profile.headline, "Senior Developer")
        self.assertEqual(self.profile.personal_website, "https://midominio.com")
        self.assertEqual(self.profile.phone, "666777888")

    def test_partial_update_does_not_erase_data(self):
        """
        Prueba que enviar solo un campo no borra los demás.
        """
        # Primero configuramos un dato
        self.profile.personal_website = "https://google.com"
        self.profile.save()

        # Enviamos SOLO el first_name
        payload = {
            "first_name": "SoloNombre"
        }
        
        response = self.client.patch(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.profile.refresh_from_db()

        # El nombre cambió
        self.assertEqual(self.user.first_name, "SoloNombre")
        # El website SE MANTIENE (no se borró)
        self.assertEqual(self.profile.personal_website, "https://google.com")

    def test_read_only_fields_are_ignored(self):
        """
        Prueba que intentar enviar email (read_only) no lo cambia.
        """
        payload = {
            "email": "hacker@evil.com", # Este campo es read_only en el serializer
            "first_name": "SafeName"
        }

        response = self.client.patch(self.url, payload, format='json')
        self.user.refresh_from_db()

        self.assertEqual(self.user.first_name, "SafeName")
        self.assertEqual(self.user.email, "test@example.com") # NO debió cambiar