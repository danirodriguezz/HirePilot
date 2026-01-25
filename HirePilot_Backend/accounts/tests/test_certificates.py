import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from accounts.models import Certificate

User = get_user_model()

@pytest.mark.django_db
class TestCertificateFlow:

    @pytest.fixture
    def user(self):
        """Crea un usuario verificado para los tests"""
        return User.objects.create_user(
            email="certified@test.com", 
            password="password123",
            is_verified=True
        )

    @pytest.fixture
    def auth_client(self, api_client, user):
        """Autentica al cliente con el usuario creado"""
        api_client.force_authenticate(user=user)
        return api_client

    def test_create_certificate_full(self, auth_client, user):
        """Prueba crear un certificado con todos los campos opcionales"""
        url = reverse('certificates-list') # Nombre generado por el Router
        data = {
            "name": "AWS Solutions Architect",
            "issuing_organization": "Amazon Web Services",
            "issue_date": "2023-01-15",
            "expiration_date": "2026-01-15",
            "credential_id": "AWS-123456",
            "credential_url": "https://aws.amazon.com/verify",
            "description": "Professional level certification"
        }

        response = auth_client.post(url, data, format='json')

        assert response.status_code == 201
        assert Certificate.objects.count() == 1
        
        cert = Certificate.objects.get()
        assert cert.user == user
        assert cert.name == "AWS Solutions Architect"
        assert cert.credential_url == "https://aws.amazon.com/verify"

    def test_create_certificate_minimal(self, auth_client):
        """Prueba crear solo con los campos obligatorios"""
        url = reverse('certificates-list')
        data = {
            "name": "Scrum Master",
            "issuing_organization": "Scrum.org",
            "issue_date": "2022-05-20"
            # Sin expiración, ID, URL o descripción
        }

        response = auth_client.post(url, data, format='json')

        assert response.status_code == 201
        cert = Certificate.objects.get()
        assert cert.name == "Scrum Master"
        assert cert.expiration_date is None

    def test_get_own_certificates_only(self, auth_client, user):
        """Seguridad: El usuario solo ve SUS certificados"""
        # 1. Certificado del usuario logueado
        Certificate.objects.create(
            user=user, 
            name="My Cert", 
            issuing_organization="Org A", 
            issue_date="2023-01-01"
        )

        # 2. Certificado de OTRO usuario
        other_user = User.objects.create_user(email="other@test.com", password="pwd")
        Certificate.objects.create(
            user=other_user, 
            name="Other Cert", 
            issuing_organization="Org B", 
            issue_date="2023-01-01"
        )

        url = reverse('certificates-list')
        response = auth_client.get(url)

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]['name'] == "My Cert"

    def test_update_certificate(self, auth_client, user):
        """Prueba actualizar un certificado existente"""
        cert = Certificate.objects.create(
            user=user, 
            name="Old Name", 
            issuing_organization="Old Org", 
            issue_date="2020-01-01"
        )

        url = reverse('certificates-detail', kwargs={'pk': cert.pk})
        data = {
            "name": "New Name Updated",
            "issuing_organization": "Old Org",
            "issue_date": "2020-01-01",
            "credential_id": "NEW-ID-999"
        }

        response = auth_client.put(url, data, format='json')

        assert response.status_code == 200
        
        cert.refresh_from_db()
        assert cert.name == "New Name Updated"
        assert cert.credential_id == "NEW-ID-999"

    def test_delete_certificate(self, auth_client, user):
        """Prueba borrar un certificado"""
        cert = Certificate.objects.create(
            user=user, 
            name="To Delete", 
            issuing_organization="Org", 
            issue_date="2020-01-01"
        )

        url = reverse('certificates-detail', kwargs={'pk': cert.pk})
        response = auth_client.delete(url)

        assert response.status_code == 204
        assert Certificate.objects.count() == 0

    def test_ordering(self, auth_client, user):
        """Verifica que los certificados se ordenan por fecha de emisión (más reciente primero)"""
        # 2020 (Antiguo)
        Certificate.objects.create(
            user=user, name="Old Cert", issuing_organization="A", issue_date="2020-01-01"
        )
        # 2024 (Nuevo)
        Certificate.objects.create(
            user=user, name="New Cert", issuing_organization="B", issue_date="2024-01-01"
        )

        url = reverse('certificates-list')
        response = auth_client.get(url)

        assert len(response.data) == 2
        # El primero debe ser el de 2024
        assert response.data[0]['name'] == "New Cert"

    def test_validation_required_fields(self, auth_client):
        """Debe fallar si falta el nombre o la organización"""
        url = reverse('certificates-list')
        data = {
            "issue_date": "2023-01-01" 
            # Faltan name y issuing_organization
        }
        response = auth_client.post(url, data)
        assert response.status_code == 400
        assert "name" in response.data
        assert "issuing_organization" in response.data