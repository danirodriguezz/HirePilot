from django.core.mail import EmailMessage
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string
from django.conf import settings

def send_verification_email(user):
    # 1. Generar token y uid
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    # 2. Construir el link al FRONTEND (React)
    # Asumimos que tu React corre en localhost:5173. 
    # En producción esto debe ser tu dominio real.
    domain = "http://localhost:5173" 
    link = f"{domain}/verify-email/{uid}/{token}"

    # 3. Crear el cuerpo del correo
    subject = 'Verifica tu cuenta en Nuestro SaaS'
    body = f"""
    Hola {user.email},
    
    Gracias por registrarte. Por favor confirma tu correo haciendo clic en el siguiente enlace:
    
    {link}
    
    Si no te registraste, ignora este mensaje.
    """

    # 4. Enviar
    email = EmailMessage(
        subject=subject,
        body=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email]
    )
    email.send()