import pytest
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    """
    Fixture global para obtener una instancia de APIClient
    de Django REST Framework en cualquier test.
    """
    return APIClient()