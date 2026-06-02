from flask_restx import Namespace, Resource, fields
from flask import request
from app.services.session_service import *


api = Namespace('sessions', description='Session operations')

session_model = api.model('Session', {
    'id': fields.Integer(readOnly=True),
    'created_at': fields.String(required=True),
    'updated_at': fields.String,
    'data': fields.String,
    'atom': fields.String,
    'notes': fields.String,
    'author': fields.String,
})

session_response_model = api.model('SessionResponse', {
    'message': fields.String,
    'session': fields.Nested(session_model)
})

@api.route('/all')
class SessionList(Resource):
    @api.marshal_list_with(session_model)
    def get(self):
        """Get all sessions"""
        try:
            return get_all_sessions()
        except Exception as e:
            api.abort(500, f"An error occurred while retrieving sessions: {str(e)}")


@api.route('/add')
class SessionAdd(Resource):
    @api.expect(session_model)
    @api.marshal_with(session_response_model, code=201)
    def post(self):
        """Save session"""
        response, status_code = create_session(request.json)  # Unpack the tuple
        #print("Response from create_session:", response)  # Debugging line

        if not response.get("success"):
            api.abort(status_code, response.get("message", "Session creation failed"))

        return {
            "message": "Saved successfully",
            "session": response.get("session")
        }, 201



@api.route('/get/<int:id>')
@api.response(404, 'Session not found')
class SessionGet(Resource):
    def get(self, id):
        """Get session by ID with decompressed data"""
        response, status_code = get_session_details(id)
        return response, status_code


@api.route('/update/<int:id>')
class SessionUpdate(Resource):
    @api.expect(session_model)
    @api.marshal_with(session_response_model)
    def put(self, id):
        """Update a session"""
        response = update_session(id, request.json)

        if not response.get("success"):
            api.abort(404, response.get("message", "Session update failed"))

        return {
            "message": response["message"],
            "session": response.get("session")
        }, 200


@api.route('/delete/<int:id>')
class SessionDelete(Resource):
    def delete(self, id):
        """Delete a session"""
        result = delete_session(id)
        
        if not result.get("success"):
            api.abort(400, result.get("message", "Failed to delete session"))

        return {"message": result["message"]}, 200

@api.route('/filter')
class SessionFilter(Resource):
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
