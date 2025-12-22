from rest_framework import generics, status, permissions
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from .utils import send_verification_email
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import UserProfile
from .serializers import UserRegistrationSerializer, CustomTokenObtainPairSerializer, UserDetailSerializer


User = get_user_model()

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

    def create(self, request, *args, **kwargs):
        # 1. Ejecutar la lógica estándar de creación (validación y guardado)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # 2. Enviar el email de verificación
        # (Opcional: Podrías hacerlo asíncrono con Celery en el futuro)
        try:
            send_verification_email(user)
        except Exception as e:
            # Si falla el email, ¿qué hacemos? 
            # Opción A: Borrar el usuario y dar error.
            # Opción B: Dejar el usuario pero avisar que no se envió el correo.
            # Por ahora, logueamos el error pero dejamos que el registro fluya.
            print(f"Error enviando correo: {e}")

        headers = self.get_success_headers(serializer.data)
        
        return Response(
            {
                "message": "Usuario creado exitosamente. Revisa tu correo para verificar la cuenta.",
                "user": serializer.data
            }, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )


class VerifyEmailView(APIView):
    permission_classes = [AllowAny] # Debe ser pública

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')

        if not uidb64 or not token:
            return Response({'error': 'Faltan parámetros'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Decodificar el ID del usuario
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Link inválido'}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar el token
        if user is not None and default_token_generator.check_token(user, token):
            user.is_verified = True
            user.save()
            return Response({'message': 'Email verificado correctamente'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'El link es inválido o ha expirado'}, status=status.HTTP_400_BAD_REQUEST)

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