from app import app, db
from app.models import Malt
import flask.ext.restless
from flask.ext.restless import ProcessingException

manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)

#TODO simplyfy this...
def post_preprocessor(data):

    errors = []
    if not data["name"] or data["name"] == "":
        errors.append({"field": "name", "error": "Must be set"})

    if "ppg" in data:
        try:
            float(data["ppg"])
        except Exception:
            errors.append({"field": "ppg", "error": "Must be number"})

    if "color" in data:
        try:
            float(data["color"])
        except Exception:
            errors.append({"field": "color", "error": "Must be number"})

    if errors:
        raise ProcessingException(message=errors,
            status_code=400)

    return data


# Create API endpoints, which will be available at /api/<tablename> by
# default. Allowed HTTP methods can be specified as well.
manager.create_api(Malt,
                    methods=['GET', 'POST', 'PUT', "DELETE"],
                    preprocessors={
                        'POST': [post_preprocessor]
                    },
                )
