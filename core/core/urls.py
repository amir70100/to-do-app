"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView, CreateView
from django.urls import reverse_lazy
from todo.forms import CustomUserCreationForm
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# Register admin, account, task, and browsable API routes.
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='todo/index.html'), name='index'),
    path('login/', auth_views.LoginView.as_view(template_name='accounts/login.html'), name='login'),
    path('signup/', CreateView.as_view(
        template_name='accounts/signup.html',
        form_class=CustomUserCreationForm,
        success_url=reverse_lazy('login')
    ), name='signup'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    path('todo/', include('todo.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path("api-auth/", include("rest_framework.urls"))
]

if settings.DEBUG:
    # Serve uploaded and static assets directly only during local development.
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
