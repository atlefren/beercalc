from app import app, db
from app.models import Malt, Hop, Yeast
import flask.ext.restless
from flask.ext.restless import ProcessingException

manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)

#TODO simplyfy this...

def verify_is_number(dict, value, errors):
    print "verify ", value
    if value in dict:
        if dict[value] == "":
            dict[value] = None
        else:
            try:
                float(dict[value])
            except Exception:
                errors.append({"field": value, "message": "Must be number"})

def verify_is_set(dict, value, errors):
    if not dict[value] or dict[value] == "":
        errors.append({"field": value, "message": "Must be set"})

def malt_put_preprocessor(instid, data):
    malt_verify(data)
    return

def malt_post_preprocessor(data):
    malt_verify(data)
    return data


def malt_verify(data):
    errors = []
    verify_is_set(data, "name", errors)
    verify_is_number(data, "ppg", errors)
    verify_is_number(data, "color", errors)

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

def hop_verify(data):
    errors = []
    verify_is_set(data, "name", errors)
    verify_is_number(data, "alpha_acid", errors)
    if errors:
        raise ProcessingException(message=errors,
            status_code=400)

# Create API endpoints, which will be available at /api/<tablename> by
# default. Allowed HTTP methods can be specified as well.
manager.create_api(Hop,
    methods=['GET', 'POST', 'PUT', "DELETE"],
    preprocessors={
        'PATCH_SINGLE': [hop_put_preprocessor],
        'POST': [hop_post_preprocessor],
        },
)

def yeast_put_preprocessor(instid, data):
    yeast_verify(data)
    return data

def yeast_post_preprocessor(data):
    yeast_verify(data)
    return data

def yeast_verify(data):
    errors = []
    verify_is_set(data, "name", errors)
    verify_is_number(data, "attenuation", errors)

    if errors:
        raise ProcessingException(message=errors,
            status_code=400)

# Create API endpoints, which will be available at /api/<tablename> by
# default. Allowed HTTP methods can be specified as well.
manager.create_api(Yeast,
    methods=['GET', 'POST', 'PUT', "DELETE"],
    preprocessors={
        'PATCH_SINGLE': [yeast_put_preprocessor],
        'POST': [yeast_post_preprocessor],
        },
)