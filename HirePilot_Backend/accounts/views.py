from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import UserProfile

class RegistrationOptionsView(APIView):
    """
    Devuelve las opciones dinámicas para los formularios de registro/perfil.
    Accesible públicamente para que el usuario pueda ver las opciones antes de registrarse.
    """
    permission_classes = [AllowAny] 

    def get(self, request):
        # Función auxiliar para formatear las opciones como lista de diccionarios
        def format_choices(choices):
            return [{"value": key, "label": str(label)} for key, label in choices]

        data = {
            "industries": format_choices(UserProfile.Industry.choices),
            "experience_ranges": format_choices(UserProfile.ExperienceRange.choices),
        }
        
        return Response(data)