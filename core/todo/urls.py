from django.urls import path
from . import views
from django.views.generic.edit import CreateView, UpdateView, DeleteView


app_name = 'todo'

urlpatterns = [
    path('', views.TaskListView.as_view(), name='task-list'),
    path('create/', views.TaskCreateView.as_view(), name='task-create'),
    path('delete/<int:pk>/delete/', views.TaskDeleteView.as_view(),name= 'task-delete'),
    path('edit/<int:pk>/edit/', views.TaskEditView.as_view(),name= 'task-edit'),
    path('toggle/<int:pk>/toggle/', views.TaskToggleView.as_view(), name='task-toggle'),
]