from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
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

    print("Usuario registrado:", username)

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
    Handle user login.
    """
    # Here you would typically handle the login logic,
    # such as validating the credentials and returning a token.
    return Response({"message": "User logged in successfully."})

@api_view(['GET'])
def profile(request):
    """
    Retrieve user profile information.
    """
    # Here you would typically retrieve the user's profile data.
    return Response({"message": "User profile retrieved successfully."})

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
