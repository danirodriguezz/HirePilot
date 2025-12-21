from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import UserProfile

# Usamos get_user_model para ser robustos
User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Se ejecuta automáticamente cada vez que se guarda un Usuario.
    Si el usuario es nuevo (created=True), creamos su perfil vacío.
    """
    if created:
        # Aquí se crea la "pulsera VIP" automática
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Opcional: Asegura que si guardas el usuario, se guarde el perfil 
    (útil si modificas algo que afecte a ambos, aunque menos crítico aquí).
    """
    # Verificamos que tenga perfil antes de guardar para evitar errores raros
    if hasattr(instance, 'profile'):
        instance.profile.save()