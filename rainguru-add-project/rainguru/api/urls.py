from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import fetch_urls, fetch_precipitation, get_data_availability, check_new_data


urlpatterns = [
    path('fetch', fetch_urls),
    path('precipitation', fetch_precipitation),
    path('available', get_data_availability),
    path('check', check_new_data)
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
