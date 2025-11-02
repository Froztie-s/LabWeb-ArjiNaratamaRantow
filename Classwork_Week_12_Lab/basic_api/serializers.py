from rest_framework import serializers
from basic_api.models import DRFPost


class DRFPostSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    remove_image = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = DRFPost
        fields = [
            'id',
            'name',
            'author',
            'uploaded',
            'rating',
            'image',
            'remove_image',
        ]
        read_only_fields = ['id', 'uploaded']

    def create(self, validated_data):
        validated_data.pop('remove_image', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        remove_image = validated_data.pop('remove_image', False)
        if remove_image and instance.image:
            # Delete the existing file without saving immediately
            instance.image.delete(save=False)
            instance.image = None

        return super().update(instance, validated_data)
