from django.urls import path
from .views import GenerateCVView

urlpatterns = [
    path('generate/', GenerateCVView.as_view(), name='generate-cv'),
]