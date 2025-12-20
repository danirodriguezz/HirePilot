from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('El email es obligatorio'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True) # Superusuario siempre verificado
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    class Plan(models.TextChoices):
        FREE = 'FREE', _('Free')
        PREMIUM = 'PREMIUM', _('Premium')
        PRO = 'PRO', _('Pro')

    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(_('first name'), max_length=150, blank=True)
    last_name = models.CharField(_('last name'), max_length=150, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Campos específicos de tu diagrama
    is_verified = models.BooleanField(default=False)
    plan = models.CharField(
        max_length=10,
        choices=Plan.choices,
        default=Plan.FREE
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email
    
class UserProfile(models.Model):
    # 1. ENUM para Industria (Igual que antes)
    class Industry(models.TextChoices):
        TECH = 'TECH', _('Tecnología y Software')
        FINANCE = 'FINANCE', _('Finanzas y Banca')
        HEALTH = 'HEALTH', _('Salud y Medicina')
        EDUCATION = 'EDUCATION', _('Educación')
        MARKETING = 'MARKETING', _('Marketing y Publicidad')
        OTHER = 'OTHER', _('Otro')
    
    # 2. NUEVO ENUM para Años de Experiencia
    # El valor de la izquierda es lo que se guarda en BD, el de la derecha lo que ve el usuario
    class ExperienceRange(models.TextChoices):
        NO_EXP = '0', _('Sin experiencia')
        ONE_TO_TWO = '1-2', _('Entre 1 y 2 años')
        TWO_TO_THREE = '2-3', _('Entre 2 y 3 años')
        THREE_TO_FOUR = '3-4', _('Entre 3 y 4 años')
        FOUR_TO_FIVE = '4-5', _('Entre 4 y 5 años')
        FIVE_TO_SIX = '5-6', _('Entre 5 y 6 años')
        SIX_PLUS = '6+', _('Más de 6 años')
    
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='profile'
    )

    headline = models.CharField(
        max_length=255, 
        help_text="Ej: Senior Full Stack Developer"
    )

    summary = models.TextField()
    linkedin_url = models.URLField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20)
    # 3. CAMBIO AQUÍ: De IntegerField a CharField con choices
    years_of_experience = models.CharField(
        max_length=10, # Suficiente para guardar '1-2', '6+', etc.
        choices=ExperienceRange.choices,
        default=ExperienceRange.NO_EXP
    )
    
    industry = models.CharField(
        max_length=50,
        choices=Industry.choices,
        default=Industry.OTHER
    )
    def __str__(self):
        # Muestra el valor legible en el admin (ej: "Entre 1 y 2 años")
        return f"{self.headline} ({self.get_years_of_experience_display()})"

class WorkExperience(models.Model):
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='work_experiences'
    )
    company = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    current_job = models.BooleanField(default=False)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-start_date'] # Ordenar por fecha descendente por defecto

    def __str__(self):
        return f"{self.role} at {self.company}"

class WorkAchievement(models.Model):
    work_experience = models.ForeignKey(
        WorkExperience, 
        on_delete=models.CASCADE, 
        related_name='achievements'
    )
    description = models.TextField()
    # Usamos JSONField de Postgres para flexibilidad en keywords
    keywords = models.JSONField(default=list) 

    def __str__(self):
        return f"Achievement for {self.work_experience}"

class Education(models.Model):
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='education'
    )
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    # Sugerencia: Podrías añadir fechas aquí también en el futuro si es relevante.

    def __str__(self):
        return f"{self.degree} at {self.institution}"

class Skill(models.Model):
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='skills'
    )
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255) # Ej: Frontend, Soft Skills, Tools

    def __str__(self):
        return self.name

class JobPosting(models.Model):
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='job_postings'
    )
    title = models.CharField(max_length=255)
    original_text = models.TextField()
    
    # Aquí guardaremos lo que la IA extraiga (keywords requeridas, tono, hard skills)
    analysis_result = models.JSONField(default=dict) 
    
    created_at = models.DateTimeField(auto_now_add=True) # Buena práctica añadir esto

    def __str__(self):
        return self.title

class TailoredCV(models.Model):
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='tailored_cvs'
    )
    job_posting = models.ForeignKey(
        JobPosting, 
        on_delete=models.CASCADE, 
        related_name='generated_cvs'
    )
    # SNAPSHOT: Guardamos exactamente qué datos se usaron para este PDF.
    # Si el usuario cambia su Master Data mañana, este CV histórico no debe romperse.
    content_snapshot = models.JSONField() 
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"CV for {self.job_posting.title} - {self.created_at.date()}"