from rest_framework import serializers


class CVGenerationRequestSerializer(serializers.Serializer):
    job_description = serializers.CharField(required=True, allow_blank=False)
    language = serializers.CharField(required=False, default='es')
