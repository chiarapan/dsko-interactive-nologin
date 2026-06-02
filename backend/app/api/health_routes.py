from flask_restx import Namespace, Resource
from app.services.health_service import health_check

api = Namespace('health', description='Health check operations')


@api.route('/')
class Health(Resource):
    def get(self):
        try:
            result = health_check()
            return {
                'status': 'ok',
                'detail': result if result else 'Service is running'
            }, 200
        except Exception as e:
            print(f"[Health Route] Error: {e}")
            return {
                'status': 'error',
                'detail': str(e)
            }, 500


@api.route('/ping')
class Ping(Resource):
    def get(self):
        print("[Ping] Received ping request")
        return {'message': 'pong'}, 200
