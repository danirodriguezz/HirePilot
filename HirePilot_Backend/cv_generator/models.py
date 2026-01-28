from django.db import models
from django.conf import settings

class CVGeneration(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='generated_cvs')
    job_description = models.TextField(help_text="El texto crudo de la oferta de trabajo")
    job_title_extracted = models.CharField(max_length=255, blank=True, null=True, help_text="Título del puesto detectado por la IA")
    
    # Aquí guardaremos el JSON estructurado que la IA nos devuelve
    structured_cv_data = models.JSONField(help_text="JSON listo para que el frontend lo consuma")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"CV para {self.job_title_extracted or 'Oferta desconocida'} - {self.user.email}"