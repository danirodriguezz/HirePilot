from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    INDUSTRY_CHOICES = [
        ('Technology', 'Tecnología'),
        ('Finance', 'Finanzas'),
        ('Healthcare', 'Salud'),
        ('Education', 'Educación'),
        ('Marketing', 'Marketing'),
        ('Retail', 'Retail'),
        ('Consulting', 'Consultoría'),
        ('Other', 'Otro')
    ]

    PLAN_CHOICES = [
        ('Free', 'Gratis'),
        ('Basic', 'Básico'),
        ('Premium', 'Premium'),
    ]

    EXPERIENCE_CHOICES = [
        ('0-1', 'Menos de 1 año'),
        ('1-3', '1-3 años'),
        ('3-5', '3-5 años'),
        ('5-10', '5-10 años'),
        ('10+', 'Más de 10 años'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profession = models.CharField(blank=True, null=True)
    years_of_experience = models.CharField(max_length=10, choices=EXPERIENCE_CHOICES, blank=True, null=True)
    industry = models.CharField(max_length=100, choices=INDUSTRY_CHOICES, blank=True, null=True)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='Free')
    newsletter = models.BooleanField(default=False)
    terms = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"