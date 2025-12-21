from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        """
        Este método se ejecuta cuando Django arranca.
        Aquí importamos las signals para que empiecen a escuchar.
        """
        import accounts.signals
