from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


app_name = 'api-v1'

# Let the router provide standard list, create, detail, update, and delete routes.
router = DefaultRouter()
router.register('tasks', views.TaskViewSet, basename='task')
urlpatterns = router.urls
urlpatterns += [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
