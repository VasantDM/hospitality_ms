from django.contrib import admin
from django.urls import path, include

admin.site.site_header = "Grand Vista Resort & Hotel PMS"
admin.site.site_title = "Grand Vista PMS Admin"
admin.site.index_title = "Hospitality Property & Operations Management"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('pms_api.urls')),
]
