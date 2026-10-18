from .serializers import TaskSerializer
from ...models import Task
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from .permissions import IsOwner


class TaskViewSet(viewsets.ModelViewSet):
    # Require login and check ownership before applying object-level actions.
    permission_classes = [IsAuthenticated, IsOwner]
    serializer_class = TaskSerializer

    def get_queryset(self):
        # Scope list and detail lookups so another user's task is never visible
        # and cannot be edited or deleted by guessing its ID.
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Assign ownership from the authenticated request, never from submitted data.
        serializer.save(user=self.request.user)
