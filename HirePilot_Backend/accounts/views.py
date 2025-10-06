from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Profile

@api_view(['POST'])
def register(request):
    """
    Handle user registration.
    """
    # User data
    username = request.data.get("email")
    email = request.data.get("email")
    password = request.data.get("password")
    first_name = request.data.get("firstName")
    last_name = request.data.get("lastName")

    # Profile data
    profession = request.data.get("profession")
    years_of_experience = request.data.get("experience")
    industry = request.data.get("industry")
    plan = request.data.get("plan")
    newsletter = request.data.get("newsletter")
    terms = request.data.get("terms")

    # Validar datos mínimos
    if not username or not email or not password:
        return Response(
            {"error": "Faltan campos obligatorios: username, email, password."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not terms:
        return Response(
            {"error": "Debe aceptar los términos y condiciones."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verificar si ya existe el usuario
    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "El nombre de usuario ya está registrado."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Crear el usuario
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )

    # Crear el perfil
    profile = Profile.objects.create(
        user=user,
        profession=profession,
        years_of_experience=years_of_experience,
        industry=industry,
        plan=plan,
        newsletter=newsletter
    )

    # Generar tokens JWT
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    return Response(
        {
            "message": "Usuario registrado correctamente.",
            "access_token": access_token,
            "refresh_token": str(refresh),
            "user_id": user.id,
            "profile_id": profile.id
        },
        status=status.HTTP_201_CREATED
    )

@api_view(['POST'])
def login(request):
    """
    Handle user login and return JWT tokens.
    """
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {"error": "Debe enviar email y contraseña."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Intentar autenticar usuario
    user = authenticate(username=email, password=password)
    if user is None:
        return Response(
            {"error": "Credenciales inválidas."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Generar tokens JWT
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    # Devolver tokens y datos opcionales
    return Response(
        {
            "access_token": access_token,
            "refresh_token": str(refresh),
            "user_id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name
        },
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Permitir acceso solo a usuarios autenticados
def profile(request):
    profile = Profile.objects.get(user=request.user)
    return Response({
        "user": {
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name
        },
        "profile": {
            "profession": profile.profession,
            "years_of_experience": profile.years_of_experience,
            "industry": profile.industry
        }
    })

@api_view(['GET'])
def industry_choices(request):
    """
    Retrieve industry choices for the profile.
    """
    from .models import Profile
    return Response({
    "industry_choices": [
        {"value": choice[0], "label": choice[1]} 
        for choice in Profile.INDUSTRY_CHOICES
        ]
    })

class LogoutView(APIView):
    """
    Handle user logout by blacklisting the refresh token.
    """
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if refresh_token is None:
            return Response({"error": "No refresh token provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()   # <<-- Invalida el refresh token
        except TokenError:
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
