import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from accounts.models import Project, Skill

User = get_user_model()

@pytest.mark.django_db
class TestProjectFlow:

    @pytest.fixture
    def user(self):
        return User.objects.create_user(
            email="creator@test.com", 
            password="password123",
            is_verified=True
        )

    @pytest.fixture
    def auth_client(self, api_client, user):
        api_client.force_authenticate(user=user)
        return api_client

    @pytest.fixture
    def user_skills(self, user):
        """Crea habilidades previas para asociar a los proyectos"""
        s1 = Skill.objects.create(user=user, name="Photoshop", skill_type="TECHNICAL")
        s2 = Skill.objects.create(user=user, name="Marketing", skill_type="TECHNICAL")
        return [s1, s2]

    def test_create_project_with_skills(self, auth_client, user, user_skills):
        """Prueba crear un proyecto completo asociando habilidades"""
        url = reverse('projects-list')
        data = {
            "title": "Rebranding Campaign",
            "role": "Art Director",
            "organization": "Agency X",
            "category": "PROFESSIONAL",
            "description": "Led the new visual identity.",
            "project_url": "https://agency.com/work",
            "resource_url": "https://drive.google.com/brief.pdf",
            "start_date": "2023-01-01",
            "skills": [s.id for s in user_skills] # Enviamos los IDs [1, 2]
        }

        response = auth_client.post(url, data, format='json')

        assert response.status_code == 201
        assert Project.objects.count() == 1
        
        project = Project.objects.get()
        assert project.user == user
        assert project.title == "Rebranding Campaign"
        assert project.role == "Art Director"
        
        # Verificar relación Many-to-Many
        assert project.skills.count() == 2
        assert "Photoshop" in [s.name for s in project.skills.all()]

    def test_create_project_minimal(self, auth_client):
        """Prueba crear proyecto solo con lo básico"""
        url = reverse('projects-list')
        data = {
            "title": "Personal Blog",
            "role": "Developer",
            "category": "PERSONAL",
            "description": "My own site."
            # Sin skills, sin fechas, sin enlaces
        }

        response = auth_client.post(url, data, format='json')

        assert response.status_code == 201
        project = Project.objects.get()
        assert project.category == "PERSONAL"
        assert project.skills.count() == 0

    def test_get_own_projects_only(self, auth_client, user):
        """Seguridad: El usuario solo ve SUS proyectos"""
        # Proyecto propio
        Project.objects.create(
            user=user, title="My Project", role="Dev", description="Desc"
        )
        
        # Proyecto ajeno
        other_user = User.objects.create_user(email="other@test.com", password="pwd")
        Project.objects.create(
            user=other_user, title="Other Project", role="Manager", description="Desc"
        )

        url = reverse('projects-list')
        response = auth_client.get(url)

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]['title'] == "My Project"

    def test_update_project_skills(self, auth_client, user, user_skills):
        """Prueba actualizar quitando/poniendo skills"""
        # Crear proyecto con 1 skill inicial
        project = Project.objects.create(
            user=user, title="Old Title", role="Junior", description="Desc"
        )
        project.skills.add(user_skills[0]) # Photoshop

        url = reverse('projects-detail', kwargs={'pk': project.pk})
        
        # Actualizamos: Cambiamos título y ponemos la OTRA skill (Marketing)
        data = {
            "title": "New Title",
            "role": "Senior",
            "description": "Updated desc",
            "skills": [user_skills[1].id] # Solo Marketing ahora
        }

        response = auth_client.put(url, data, format='json')

        assert response.status_code == 200
        
        project.refresh_from_db()
        assert project.title == "New Title"
        assert project.skills.count() == 1
        assert project.skills.first().name == "Marketing"

    def test_delete_project(self, auth_client, user):
        """Prueba borrar proyecto"""
        project = Project.objects.create(
            user=user, title="To Delete", role="N/A", description="..."
        )

        url = reverse('projects-detail', kwargs={'pk': project.pk})
        response = auth_client.delete(url)

        assert response.status_code == 204
        assert Project.objects.count() == 0