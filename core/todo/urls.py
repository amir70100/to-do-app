from django.urls import path, include
from django.views.generic import TemplateView


app_name = 'todo'

urlpatterns = [
    # Serve the task interface and mount the versioned API below the app path.
    path('', TemplateView.as_view(template_name='todo/index.html'), name='task-list'),
    path('api/v1/', include('todo.api.v1.urls')),
]
