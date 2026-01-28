from rest_framework import serializers
from .models import CVGeneration

class CVGenerationRequestSerializer(serializers.Serializer):
    job_description = serializers.CharField(required=True, allow_blank=False)

class CVGenerationResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CVGeneration
        fields = ['id', 'job_title_extracted', 'structured_cv_data', 'created_at']