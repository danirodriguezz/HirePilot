from rest_framework import generics, status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import UserProfile
from .serializers import UserRegistrationSerializer, CustomTokenObtainPairSerializer, UserDetailSerializer

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
    
# Vista de Registro
class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

# Vista de Login Personalizada
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Vista para obtener y actualizar el usuario logueado
class ManageUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Magia: Devuelve el usuario del request (sacado del token)
        return self.request.user

# Vista para Logout (Blacklist del token)
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)