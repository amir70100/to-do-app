from django.contrib import admin
from .models import User, Task


admin.site.register(User)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'completed', 'created_at')
    list_filter = ('completed',)


# Register your models here.
