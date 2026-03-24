from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from .models import (
    Certificate,
    Education,
    Language,
    Project,
    Skill,
    UserProfile,
    WorkExperience,
)
from .serializers import (
    CertificateSerializer,
    CustomTokenObtainPairSerializer,
    EducationSerializer,
    LanguageSerializer,
    ProjectSerializer,
    SkillSerializer,
    UserDetailSerializer,
    UserRegistrationSerializer,
    WorkExperienceSerializer,
)

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
            return [{'value': key, 'label': str(label)} for key, label in choices]

        data = {
            'industries': format_choices(UserProfile.Industry.choices),
            'experience_ranges': format_choices(UserProfile.ExperienceRange.choices),
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

        # HEMOS ELIMINADO EL BLOQUE QUE ENVIABA EL EMAIL DE VERIFICACIÓN AQUÍ

        headers = self.get_success_headers(serializer.data)

        return Response(
            {
                # Mensaje actualizado para no mencionar el correo
                'message': 'Usuario creado exitosamente.', 
                'user': serializer.data,
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )




# Vista de Login Personalizada
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        # 1. Ejecutamos el flujo normal de SimpleJWT para que valide usuario/contraseña
        response = super().post(request, *args, **kwargs)

        # 2. Si el login fue exitoso (código 200)
        if response.status_code == status.HTTP_200_OK:
            # Extraemos el refresh_token generado por SimpleJWT
            refresh_token = response.data.get('refresh')

            # 3. Inyectamos la cookie súper segura en la respuesta
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=not settings.DEBUG,  # True en producción, False en local
                samesite='Lax',
                max_age=60 * 60 * 24 * 7,  # Opcional: 7 días en segundos
            )

            # 4. (Opcional) Borramos el refresh token del cuerpo JSON para
            # forzar al frontend a que no pueda guardarlo en localStorage
            del response.data['refresh']

        return response


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')

        # 1. SOLUCIÓN A LA INMUTABILIDAD: Creamos un diccionario vacío
        data = {}

        # 2. Copiamos los datos originales (si los hay) al nuevo diccionario
        data.update(request.data)

        # 3. Inyectamos la cookie de forma segura en nuestro diccionario copiado
        if refresh_token:
            data['refresh'] = refresh_token

        # 4. Le pasamos 'data' (nuestra copia mutable) al serializador, NO request.data
        serializer = self.get_serializer(data=data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


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
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class WorkExperienceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # IMPORTANTE: Filtramos para que el usuario solo vea SU propia experiencia
        return WorkExperience.objects.filter(user=self.request.user).order_by('-start_date')

    def perform_create(self, serializer):
        # Inyectamos el usuario logueado al crear el registro
        serializer.save(user=self.request.user)


class EducationViewSet(viewsets.ModelViewSet):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # El usuario solo ve SU propia educación
        return Education.objects.filter(user=self.request.user).order_by('-start_date')

    def perform_create(self, serializer):
        # Asignamos automáticamente el usuario logueado
        serializer.save(user=self.request.user)


class CertificateViewSet(viewsets.ModelViewSet):
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # El usuario solo ve SUS propios certificados
        return Certificate.objects.filter(user=self.request.user).order_by('-issue_date')

    def perform_create(self, serializer):
        # Asignar automáticamente el certificado al usuario autenticado
        serializer.save(user=self.request.user)


class LanguageViewSet(viewsets.ModelViewSet):
    serializer_class = LanguageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtra para que el usuario solo vea SUS idiomas
        return Language.objects.filter(user=self.request.user).order_by('language')

    def perform_create(self, serializer):
        # Asigna el usuario automáticamente al crear
        serializer.save(user=self.request.user)


class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Importar: from .models import Project
# Importar: from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Optimización: 'prefetch_related' acelera la carga de la relación ManyToMany
        return (
            Project.objects.filter(user=self.request.user)
            .prefetch_related('skills')
            .order_by('-end_date')
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
