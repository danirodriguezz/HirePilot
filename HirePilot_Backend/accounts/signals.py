# accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import UserProfile

User = get_user_model()

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Se ejecuta automáticamente cada vez que se guarda un Usuario.
    Maneja tanto la creación como la actualización en una sola función.
    """
    if created:
        UserProfile.objects.create(user=instance)
    else:
        # Si el usuario ya existía y se actualizó, guardamos el perfil por si acaso
        if hasattr(instance, 'profile'):
            instance.profile.save()