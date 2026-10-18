from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """Grant object-level access only to the task's owner."""

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

