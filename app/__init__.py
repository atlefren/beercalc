import os
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.login import LoginManager
from flask.ext.openid import OpenID
#from config import basedir
from flask.ext.assets import Environment, Bundle
from webassets.loaders import PythonLoader

app = Flask(__name__)
#app.config.from_object('config')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://localhost:5432/beercalc') #os.environ['DATABASE_URL']
db = SQLAlchemy(app)

lm = LoginManager()
lm.init_app(app)
lm.login_view = 'login'
oid = OpenID(app, 'tmp')



assets = Environment(app)
bundles = PythonLoader('assetbundle').load_bundles()
for name, bundle in bundles.iteritems():
    assets.register(name, bundle)


from app import views, models, api

