from app import app, db, models
from flask.ext import restful
from flask.ext.restful import reqparse, abort
from flask.ext.restful import Resource, fields, marshal_with

import simplejson


api = restful.Api(app)

resource_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'color': fields.String,
    'ppg': fields.String,
    }
class Malt(Resource):

    def get(self, malt_id):

        malt = models.Malt.query.get(malt_id)
        if not malt:
            return "Malt {} doesn't exist".format(malt_id), 404
        return simplejson.dumps(malt.serialize)

    def put(self, malt_id):

        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, location='json')
        args = parser.parse_args()

        malt = models.Malt.query.get(malt_id)
        if not malt:
            return "Malt {} doesn't exist".format(malt_id), 404

        data = simplejson.loads(args['malt'])
        malt.name = data["name"]
        db.session.commit()

        return simplejson.dumps(malt.serialize), 201

class Malts(Resource):


    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('q', type=str)
        args = parser.parse_args()
        if args["q"]:
            return [malt for malt in MALTS if args["q"].lower() in malt['name'].lower()]

        return simplejson.dumps([malt.serialize for malt in models.Malt.query.all()])

    @marshal_with(resource_fields)
    def post(self):

        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, location='json', required=True, help='Must be set')
        parser.add_argument('color', type=float, location='json', help='hmm')
        parser.add_argument('ppg', type=float, location='json')
        args = parser.parse_args()

        print args
        malt = models.Malt(args)
        db.session.add(malt)
        db.session.commit()

        return malt

api.add_resource(Malt, '/api/malt/<string:malt_id>')
api.add_resource(Malts, '/api/malts/')