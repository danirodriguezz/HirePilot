from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import CustomUser, UserProfile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

# --- LOGIN PERSONALIZADO ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Personalizamos el login para devolver datos extra y 
    BLOQUEAR usuarios no verificados.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Añadir claims personalizados al token encriptado si quieres
        token['email'] = user.email
        token['is_verified'] = user.is_verified
        return token

    def validate(self, attrs):
        # 1. Ejecuta la validación estándar (verifica email y password)
        data = super().validate(attrs)

        # 2. A este punto, la contraseña es correcta.
        # Ahora verificamos si el usuario confirmó su email.
        if not self.user.is_verified:
            raise AuthenticationFailed(
                detail="Tu cuenta aún no ha sido verificada. Por favor revisa tu correo electrónico.",
                code="account_not_verified"
            )

        # 3. Si todo está bien, añadimos datos extra a la respuesta JSON
        data['user_id'] = self.user.id
        data['name'] = self.user.first_name
        data['email'] = self.user.email
        
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    # Mapeo directo a los campos del perfil anidado
    industry = serializers.ChoiceField(choices=UserProfile.Industry.choices, source='profile.industry')
    experience = serializers.ChoiceField(choices=UserProfile.ExperienceRange.choices, source='profile.years_of_experience')
    profession = serializers.CharField(source='profile.headline')

    class Meta:
        model = User
        fields = [
            'email', 'password', 'confirm_password', 'first_name', 'last_name', 
            'industry', 'experience', 'profession'
        ]

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return data

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        validated_data.pop('confirm_password')

        with transaction.atomic():
            # 1. Crear usuario (La Signal se dispara AQUÍ y crea un perfil vacío)
            user = User.objects.create_user(**validated_data)
            
            # 2. Actualizar el perfil que la Signal ya creó
            if hasattr(user, 'profile'):
                profile = user.profile
                profile.industry = profile_data.get('industry')
                profile.years_of_experience = profile_data.get('years_of_experience')
                profile.headline = profile_data.get('headline')
                
                # Manejar campos obligatorios vacíos
                profile.phone = "" 
                
                profile.save()
            
        return user
    
# 1. Serializer para el Perfil (Detalles extra)
class UserProfileSerializer(serializers.ModelSerializer):
    years_of_experience_display = serializers.CharField(source='get_years_of_experience_display', read_only=True)
    industry_display = serializers.CharField(source='get_industry_display', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'headline', 
            'summary', 
            'linkedin_url', 
            'phone',
            'personal_website',
            'years_of_experience', 
            'years_of_experience_display', # Para mostrar "Entre 1 y 2 años" en el front
            'industry',
            'industry_display'
        ]
        read_only_fields = ['industry_display', 'industry']

# 2. Serializer Principal del Usuario (User + Profile)
class UserDetailSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer() # Nested Serializer

    class Meta:
        model = User
        fields = [
            'id', 
            'email', 
            'first_name', 
            'last_name', 
            'plan', 
            'is_verified', 
            'profile'
        ]
        read_only_fields = ['email', 'is_verified', 'plan']
    
    # SOBRESCRIBIMOS EL MÉTODO UPDATE
    def update(self, instance, validated_data):
        # 1. Extraemos los datos del perfil (si vienen en la petición)
        profile_data = validated_data.pop('profile', None)

        # 2. Actualizamos los datos del Usuario base (first_name, last_name)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 3. Actualizamos los datos del Perfil relacionado
        if profile_data:
            # Accedemos a la relación inversa definida en models.py (related_name='profile')
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance