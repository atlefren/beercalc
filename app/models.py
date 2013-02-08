from app import db


ROLE_USER = 0
ROLE_ADMIN = 1

class User(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(64), index = True, unique = True)
    email = db.Column(db.String(120), index = True, unique = True)
    role = db.Column(db.SmallInteger, default = ROLE_USER)

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return unicode(self.id)

    def __repr__(self):
        return '<User %r>' % (self.username)

from collections import OrderedDict




class Malt(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(140))
    color = db.Column(db.Float)
    ppg = db.Column(db.Float)
    def __repr__(self):
        return '<Malt %r>' % (self.name)

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id'         : self.id,
            'name': self.name,
            'color': self.color,
            'ppg': self.ppg
        }

class Hop(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(140))
    alpha_acid = db.Column(db.Float)

    def __repr__(self):
        return '<Hop %r>' % (self.name)

class Yeast(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(140))
    attenuation = db.Column(db.Integer)
    type = db.Column(db.String(50))

    def __repr__(self):
        return '<Yeast %r>' % (self.name)


