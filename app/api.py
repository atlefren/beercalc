from app import app, db, models
from flask.ext import restful
from flask.ext.restful import reqparse, abort
import simplejson

api = restful.Api(app)

parser = reqparse.RequestParser()
parser.add_argument('malt', type=str)
parser.add_argument('q', type=str)

class Malt(restful.Resource):
    def get(self, malt_id):

        malt = models.Malt.query.get(malt_id)
        if not malt:
            return "Malt {} doesn't exist".format(malt_id), 404
        return simplejson.dumps(malt.serialize)

    def put(self, malt_id):
        args = parser.parse_args()

        malt = models.Malt.query.get(malt_id)
        if not malt:
            return "Malt {} doesn't exist".format(malt_id), 404

        data = simplejson.loads(args['malt'])
        malt.name = data["name"]
        db.session.commit()

        return simplejson.dumps(malt.serialize), 201

class Malts(restful.Resource):
    def get(self):
        args = parser.parse_args()
        if args["q"]:
            return [malt for malt in MALTS if args["q"].lower() in malt['name'].lower()]

        return simplejson.dumps([malt.serialize for malt in models.Malt.query.all()])

    def post(self):
        args = parser.parse_args()
        data = simplejson.loads(args["malt"])
        malt = models.Malt(name=data["name"])
        db.session.add(malt)
        db.session.commit()
        return simplejson.dumps(malt.serialize), 201

api.add_resource(Malt, '/api/malt/<string:malt_id>')
api.add_resource(Malts, '/api/malts/')