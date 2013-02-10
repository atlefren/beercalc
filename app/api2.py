from app import app, db
from app.models import Malt
import flask.ext.restless
from flask.ext.restless import ProcessingException

manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)

#TODO simplyfy this...

def put_preprocessor(instid, data):
    verify(data)
    return data

def post_preprocessor(data):
    verify(data)
    return data

def verify(data):
    errors = []
    if not data["name"] or data["name"] == "":
        errors.append({"field": "name", "message": "Must be set"})

    if "ppg" in data:
        try:
            float(data["ppg"])
        except Exception:
            errors.append({"field": "ppg", "message": "Must be number"})

    if "color" in data:
        try:
            float(data["color"])
        except Exception:
            errors.append({"field": "color", "message": "Must be number"})

    if errors:
        raise ProcessingException(message=errors,
            status_code=400)

# Create API endpoints, which will be available at /api/<tablename> by
# default. Allowed HTTP methods can be specified as well.
manager.create_api(Malt,
                    methods=['GET', 'POST', 'PUT', "DELETE"],
                    preprocessors={
                        'PATCH_SINGLE': [put_preprocessor],
                        'POST': [post_preprocessor],
                    },
                )
