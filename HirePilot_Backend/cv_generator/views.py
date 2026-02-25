from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import CVGenerationRequestSerializer
from .services import CVGeneratorService

class GenerateCVView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CVGenerationRequestSerializer(data=request.data)
        if serializer.is_valid():
            job_desc = serializer.validated_data['job_description']
            language = serializer.validated_data.get('language', 'es')
            
            # Instanciamos el servicio
            generator = CVGeneratorService(user=request.user, job_description=job_desc, language=language)
            try:
                # Obtenemos el JSON estructurado (lógica de IA)
                ai_result_json = generator.generate_cv()
                # Devolvemos la respuesta al frontend
                response_data = {
                    "job_title_extracted": ai_result_json.get('job_title_target', 'N/A'),
                    "structured_cv_data": ai_result_json
                }
                
                # Cambiamos el status a 200 OK (ya que no estamos creando un recurso en BD)
                return Response(response_data, status=status.HTTP_200_OK)
                
            except Exception as e:
                # Aquí loggeamos el error real en servidor
                print(f"Error generando CV: {str(e)}")
                return Response(
                    {"error": "Hubo un problema procesando la solicitud con la IA."}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)