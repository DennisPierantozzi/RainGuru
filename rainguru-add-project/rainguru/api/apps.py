from api.update_predictions import scheduler

from django.apps import AppConfig
from django.conf import settings

import os


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        print(f"ID PROCESSO:  c{os.getpid()}")
        if not settings.TESTING:
            scheduler.start()
