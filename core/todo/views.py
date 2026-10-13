from django.shortcuts import render, get_object_or_404
from django.views import View
from django.http import JsonResponse
from django.views.generic import ListView, CreateView
from .models import Task
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.edit import UpdateView, DeleteView
from django.urls import reverse_lazy
from .forms import TaskForm

class TaskListView(LoginRequiredMixin, ListView):
    model = Task
    template_name = 'todo/task_list.html'
    context_object_name = 'tasks'

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

class TaskCreateView(LoginRequiredMixin, CreateView):
    model = Task
    fields = ['title']
    template_name = 'todo/task_form.html'
    success_url = reverse_lazy('todo:task-list')

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)

class TaskDeleteView(LoginRequiredMixin, DeleteView):
    model = Task
    template_name = 'todo/task-delete.html'
    success_url = reverse_lazy('todo:task-list')

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

class TaskEditView(LoginRequiredMixin, UpdateView):
    model = Task
    form_class = TaskForm
    template_name = 'todo/task_form.html'
    success_url = reverse_lazy('todo:task-list')

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)


class TaskToggleView(LoginRequiredMixin, View):
    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk, user=request.user)
        task.completed = not task.completed
        task.save(update_fields=['completed'])
        return JsonResponse({'completed': task.completed})

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

# Create your views here.
