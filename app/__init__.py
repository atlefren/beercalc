import os
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.login import LoginManager

from flask.ext.assets import Environment
from webassets.loaders import PythonLoader
from flask_googlelogin import GoogleLogin

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'postgresql://localhost:5432/beercalc',

)
app.config.update(
    SECRET_KEY=os.environ.get('SECRET_KEY', ''),
    SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', 'postgresql://localhost:5432/beercalc'),
    GOOGLE_LOGIN_CLIENT_ID=os.environ.get('GOOGLE_LOGIN_CLIENT_ID', ''),
    GOOGLE_LOGIN_CLIENT_SECRET=os.environ.get('GOOGLE_LOGIN_CLIENT_SECRET', ''),
    GOOGLE_LOGIN_REDIRECT_URI=os.environ.get('GOOGLE_LOGIN_REDIRECT_URI', ''),
)

db = SQLAlchemy(app)

lm = LoginManager()
lm.init_app(app)
lm.login_view = 'login'

googlelogin = GoogleLogin(app, lm)

assets = Environment(app)
bundles = PythonLoader('assetbundle').load_bundles()
for name, bundle in bundles.iteritems():
    assets.register(name, bundle)


from app import views, login, models, api
