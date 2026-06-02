from flask_restx import Namespace, Resource, fields
from flask import request, send_file
from app.services.optimizer_service import calculate_feature_importance, generate_gif

api = Namespace("optimizer", description="Random Forest importance & GIF")

# Input models
importance_input = api.model("ImportanceInput", {
    "X": fields.List(fields.Raw(), required=True, description="Feature matrix"),
    "y": fields.List(fields.Float, required=True, description="Target values"),
})

gif_input = api.model("GifInput", {
    "x": fields.List(fields.Float, required=True, description="X values"),
    "y": fields.List(fields.Float, required=True, description="Y values"),
    "cost": fields.List(fields.Float, required=True, description="Cost values"),
    "total_iters": fields.Integer(required=True, description="Total iterations"),
    "n_particles": fields.Integer(required=True, description="Particles per iteration"),
    "filename": fields.String(required=False, description="Output filename for download")
})


@api.route("/importance")
class Importance(Resource):
    @api.expect(importance_input)
    def post(self):
        try:
            data = request.get_json()
            if not data or "X" not in data or "y" not in data:
                return {"error": "Missing X or y in request"}, 400

            result = calculate_feature_importance(data["X"], data["y"])
            return result
        except Exception as e:
            return {"error": str(e)}, 500


@api.route("/gif")
class GenerateGIF(Resource):
    @api.expect(gif_input)
    def post(self):
        try:
            data = request.get_json()
            gif_buf, filename = generate_gif(
                data["x"], data["y"], data["cost"],
                data["total_iters"], data["n_particles"],
                data.get("filename", "default")
            )
            return send_file(
                gif_buf,
                mimetype="image/gif",
                as_attachment=True,
                download_name=filename
            )
        except Exception as e:
            return {"error": str(e)}, 500
