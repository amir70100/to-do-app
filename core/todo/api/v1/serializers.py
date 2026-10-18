from rest_framework import serializers
from ...models import Task


class TaskSerializer(serializers.ModelSerializer):
    # Expose task data while keeping server-managed fields read-only.
    class Meta:
        model = Task
        fields = ['id', 'title', 'user', 'completed', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
