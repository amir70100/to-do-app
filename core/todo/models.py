from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


# Use email addresses as the unique login identifier while retaining Django's user fields.
class User(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


# Each task belongs to one account and stores its completion state and creation time.
class Task(models.Model):
    user = models.ForeignKey("todo.User", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
