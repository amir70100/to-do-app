from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter


app_name = 'api-v1'

# Let the router provide standard list, create, detail, update, and delete routes.
router = DefaultRouter()
router.register('tasks', views.TaskViewSet, basename='task')
urlpatterns = router.urls
