from django.contrib import admin
from .models import User, Task

# Keep user records available in Django's admin site.
admin.site.register(User)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    # Show ownership and completion at a glance and allow filtering by status.
    list_display = ("title", "user", "completed", "created_at")
    list_filter = ("completed",)
