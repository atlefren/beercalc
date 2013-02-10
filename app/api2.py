from app import app, db
from app.models import Malt, Hop
import flask.ext.restless
from flask.ext.restless import ProcessingException

manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)

#TODO simplyfy this...

def malt_put_preprocessor(instid, data):
    malt_verify(data)
    return data

def malt_post_preprocessor(data):
    malt_verify(data)
    return data

def malt_verify(data):
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
                        'PATCH_SINGLE': [malt_put_preprocessor],
                        'POST': [malt_post_preprocessor],
                    },
                )

def hop_put_preprocessor(instid, data):
    hop_verify(data)
    return data

def hop_post_preprocessor(data):
    hop_verify(data)
    return data

def malt_verify(data):
    errors = []
    if not data["name"] or data["name"] == "":
        errors.append({"field": "name", "message": "Must be set"})

    if "alpha_acid" in data:
        try:
            float(data["alpha_acid"])
        except Exception:
            errors.append({"field": "alpha_acid", "message": "Must be number"})

    if errors:
        raise ProcessingException(message=errors,
            status_code=400)

# Create API endpoints, which will be available at /api/<tablename> by
# default. Allowed HTTP methods can be specified as well.
manager.create_api(Hop,
    methods=['GET', 'POST', 'PUT', "DELETE"],
    preprocessors={
        'PATCH_SINGLE': [malt_put_preprocessor],
        'POST': [malt_post_preprocessor],
        },
)