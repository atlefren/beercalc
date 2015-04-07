from flask import (render_template, g, abort)
from flask.ext.login import current_user, login_required
from app import app
from models import Brew, Malt, Hop, Yeast, Style
import simplejson

'''
@lm.user_loader
def load_user(id):
    return User.query.get(int(id))
'''


@app.before_request
def before_request():
    g.user = current_user


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/ingredients/malt/')
def malt_view():
    malts = simplejson.dumps(
        [malt.serialize for malt in Malt.query.order_by(Malt.name)]
    )
    return render_template('malt_list.html', malts=malts)


@app.route('/ingredients/hops/')
def hops():
    hops = simplejson.dumps(
        [malt.serialize for malt in Hop.query.order_by(Hop.name)]
    )
    return render_template('hop_list.html', hops=hops)


@app.route('/ingredients/yeast/')
def yeast():
    yeasts = simplejson.dumps(
        [malt.serialize for malt in Yeast.query.order_by(Yeast.name)]
    )
    return render_template('yeast_list.html', yeasts=yeasts)


def serialize_styles():
    styles = Style.query.all()
    return simplejson.dumps([style.serialize for style in styles])


@app.route('/brews/my/')
@login_required
def my_brews():
    brews = Brew.query.filter_by(user=g.user).order_by(Brew.name).all()
    return render_template('brew_list.html', brews=brews, title='My brews')


@app.route('/brews/add/')
@login_required
def add_brew():
    return render_template(
        'brewsheet.html',
        brew=None,
        is_own=True,
        styles=serialize_styles()
    )


@app.route('/brews/<int:brew_id>/')
def show_brew(brew_id):
    brew = Brew.query.get(brew_id)
    is_own = (g.user.is_authenticated() and brew.user_id == g.user.id)
    if brew.public or is_own:
        return render_template(
            'brewsheet.html',
            brew=simplejson.dumps(brew.serialize),
            styles=serialize_styles(),
            is_own=is_own
        )
    abort(404)


@app.route('/brews/browse/')
def browse_brews():
    brews = Brew.query.filter_by(public=True).order_by(Brew.name).all()
    return render_template(
        'brew_list.html',
        brews=brews,
        title='Browse brews',
        show_brewer=True
    )
