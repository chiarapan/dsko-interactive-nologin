from flask_restx import Resource, Namespace
from app.services.parse_service import *

api = Namespace("parse", description="Structure file parsing API")


@api.route('/geostructure')
class ParseStructure(Resource):
    @api.expect(upload_parser)
    def post(self):
        args = upload_parser.parse_args()
        file = args.get('file')

        if not file:
            print("[parse] No file provided")
            return {"error": "No file provided"}, 400

        try:
            structure_data = parse_structure_file(file)
            print("[parse] Parsed structure keys:", list(structure_data.keys()))
            return structure_data, 200

        except ValueError as ve:
            print("[parse] ValueError:", ve)
            return {"error": str(ve)}, 400

        except Exception as e:
            print("[parse] Unexpected error:", e)
            return {"error": str(e)}, 500


@api.route('/bandstructure')
class BandParse(Resource):
    @api.expect(upload_parser_band)
    def post(self):
        args = upload_parser_band.parse_args()
        file = args.get("file")

        if not file:
            print("[band/parse] No file provided")
            return {"error": "No file provided"}, 400

        try:
            band_data = parse_band_structure_file(file)
            if isinstance(band_data, dict):
                print("[band/parse] Parsed bandstructure keys:", list(band_data.keys()))
            elif isinstance(band_data, list):
                print(f"[band/parse] Parsed bandstructure list, first item: {band_data[0] if band_data else 'Empty'}")
            else:
                print("[band/parse] Parsed bandstructure data type:", type(band_data))
            return band_data, 200

        except ValueError as ve:
            print("[band/parse] ValueError:", ve)
            return {"error": str(ve)}, 400

        except Exception as e:
            print("[band/parse] Unexpected error:", e)
            return {"error": "Internal server error"}, 500
