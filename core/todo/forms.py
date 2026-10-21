from django.contrib.auth.forms import UserCreationForm

from .models import User


class CustomUserCreationForm(UserCreationForm):
    """Create accounts using the project's email-based custom user model."""

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('username', 'email')
