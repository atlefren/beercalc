from flask import (render_template, g, abort)
from flask.ext.login import current_user, login_required
from app import app
from models import Brew, Malt, Hop, Yeast
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


@app.route('/brews/my/')
@login_required
def my_brews():
    brews = Brew.query.filter_by(user=g.user).all()
    return render_template('brew_list.html', brews=brews, title='My brews')


@app.route('/brews/add/')
@login_required
def add_brew():
    return render_template('brewsheet.html', brew=None, is_own=True)


@app.route('/brews/<int:brew_id>/')
def show_brew(brew_id):
    brew = Brew.query.get(brew_id)
    is_own = (g.user.is_authenticated() and brew.user_id == g.user.id)
    if brew.public or is_own:
        return render_template(
            'brewsheet.html',
            brew=simplejson.dumps(brew.serialize),
            is_own=is_own
        )
    abort(404)


@app.route('/brews/browse/')
def browse_brews():
    brews = Brew.query.filter_by(public=True).all()
    return render_template(
        'brew_list.html',
        brews=brews,
        title='Browse brews',
        show_brewer=True
    )

'''
@app.route('/login', methods=['GET', 'POST'])
@oid.loginhandler
def login():
    if g.user is not None and g.user.is_authenticated():
        return redirect(url_for('index'))

    if request.method == 'POST':
        providers = {
            'google': 'https://www.google.com/accounts/o8/id',
            'myopenid': 'https://www.myopenid.com'
        }
        provider = providers[request.form['openid_provider']]
        session['remember_me'] = 'remember_me' in request.form
        return oid.try_login(
            provider,
            ask_for=['nickname', 'email', 'fullname']
        )
    else:
        return render_template('login.html')


@oid.after_login
def after_login(resp):
    if resp.email is None or resp.email == "":
        flash('Invalid login. Please try again.')
        redirect(url_for('login'))
    user = User.query.filter_by(email=resp.email).first()

    if user is None:
        username = resp.nickname
        if username is None or username == "":
            username = resp.email.split('@')[0]
        user = User(
            username=username,
            email=resp.email,
            name=resp.fullname,
            role=ROLE_USER
        )
        db.session.add(user)
        db.session.commit()
    remember_me = False
    if 'remember_me' in session:
        remember_me = session['remember_me']
        session.pop('remember_me', None)
    login_user(user, remember = remember_me)
    return redirect(request.args.get('next') or url_for('index'))


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))
'''