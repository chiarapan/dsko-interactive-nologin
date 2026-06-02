from flask_restx import Namespace, Resource, fields
from flask import request
from app.services.optimizer_session_service import (
    create_optimizer_session,
    get_all_sessions,
    get_session_details,
    delete_session,
    update_optimizer_session,
    get_sessions_by_filters
)

api = Namespace('optimizer', description='Optimizer session operations')

optimizer_session_model = api.model('OptimizerSession', {
    'id': fields.Integer(readOnly=True),
    'created_at': fields.String,  
    'updated_at': fields.String,
    'data': fields.String(required=True, description='CSV content as raw text'),
    'author': fields.String(required=True, description='Author name'),
    'notes': fields.String(description='Optional notes'),
    'atom': fields.String(description='Optional atom'),
    'numParticles': fields.String(description='Optional number of particles'),

})

optimizer_session_response = api.model('OptimizerSessionResponse', {
    'message': fields.String,
    'session': fields.Nested(optimizer_session_model)
})

optimizer_session_update_model = api.model('OptimizerSessionUpdate', {
    'author': fields.String(description='Author name'),
    'notes': fields.String(description='Optional notes'),
    'atom': fields.String(description='Optional atom'),
})

@api.route('/all')
class OptimizerSessionList(Resource):
    @api.marshal_list_with(optimizer_session_model)
    def get(self):
        """List all optimizer sessions"""
        try:
            return get_all_sessions()
        except Exception as e:
            api.abort(500, f"An error occurred while retrieving optimizer sessions: {str(e)}")


@api.route('/save')
class OptimizerSessionCreate(Resource):
    @api.expect(optimizer_session_model)
    @api.marshal_with(optimizer_session_response, code=201)
    def post(self):
        """Create a new optimizer session"""
        payload = request.json
        response, status_code = create_optimizer_session(payload)
        if not response.get("success"):
            api.abort(status_code, response.get("message", "Failed to create optimizer session"))
        return {
            "message": "Optimizer session created successfully",
            "session": response.get("session")
        }, 201


@api.route('/get/<int:id>')
@api.response(404, 'Optimizer session not found')
class OptimizerSessionGet(Resource):
    @api.marshal_with(optimizer_session_response)
    def get(self, id):
        """Get optimizer session by ID"""
        response, status_code = get_session_details(id)
        if status_code != 200:
            api.abort(status_code, response.get("message", "Optimizer session not found"))
        return {
            "message": "Optimizer session retrieved successfully",
            "session": response.get("session")
        }, 200


@api.route('/update/<int:id>')
@api.response(404, 'Optimizer session not found')
class OptimizerSessionUpdate(Resource):
    @api.expect(optimizer_session_update_model)
    @api.marshal_with(optimizer_session_response)
    def put(self, id):
        """Update author, atom, and notes for an optimizer session"""
        updates = request.json or {}
        response, status_code = update_optimizer_session(id, updates)
        if not response.get("success"):
            api.abort(status_code, response.get("message", "Failed to update optimizer session"))
        return {
            "message": "Optimizer session updated successfully",
            "session": response.get("session")
        }, status_code


@api.route('/delete/<int:id>')
class OptimizerSessionDelete(Resource):
    def delete(self, id):
        """Delete an optimizer session"""
        result = delete_session(id)
        if not result.get("success"):
            api.abort(400, result.get("message", "Failed to delete optimizer session"))
        return {"message": result["message"]}, 200


@api.route('/search')
class OptimizerSessionFilter(Resource):
    def get(self):
        author = request.args.get('author')
        atom = request.args.get('atom')
        start_date = request.args.get('start_date') 
        end_date = request.args.get('end_date')

        try:
            filtered_sessions = get_sessions_by_filters(
                author=author,
                atom=atom,
                start_date=start_date,
                end_date=end_date
            )
            return filtered_sessions, 200
        except Exception as e:
            print(f"[GET /sessions/filter] Error: {e}")
            api.abort(500, f"Error filtering sessions: {str(e)}")
