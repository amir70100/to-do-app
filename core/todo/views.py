from django.shortcuts import render
from django.views.generic import ListView
from .models import Task

class TaskListView(ListView):
   # model = Task
    template_name = 'todo/task_list.html'
    context_object_name = 'tasks'

# Create your views here.
