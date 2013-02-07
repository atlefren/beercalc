from flask import render_template, flash, redirect, session, url_for, request, g
from flask.ext.login import login_user, logout_user, current_user, login_required
from app import app, db, lm, oid
from models import User, Malt, ROLE_USER, ROLE_ADMIN

@lm.user_loader
def load_user(id):
    return User.query.get(int(id))

@app.before_request
def before_request():
    g.user = current_user

@app.route('/')
#@login_required
def index():
    user = g.user
    print user
    return render_template('index.html')

@app.route('/ingredients/malt/')
def malt_view():
    return render_template('malt_list.html', malts=Malt.query.order_by(Malt.name))

@app.route('/ingredients/hops/')
def hops():
    return render_template('hop_list.html')

@app.route('/ingredients/yeast/')
def yeast():
    return render_template('yeast_list.html')

@app.route('/brews/my/')
@login_required
def my_brews():
    return render_template('base.html')

@app.route('/brews/add/')
@login_required
def add_brew():
    return render_template('brewsheet.html', brew=None)

@app.route('/brews/browse/')
def browse_brews():
    return render_template('base.html')

@app.route('/login', methods = ['GET', 'POST'])
@oid.loginhandler
def login():
    if g.user is not None and g.user.is_authenticated():
        return redirect(url_for('index'))

    if request.method == 'POST':
        print "....", request.form

        providers = {
            'google': 'https://www.google.com/accounts/o8/id',
            'myopenid': 'https://www.myopenid.com'
        }
        provider = providers[request.form['openid_provider']]
        session['remember_me'] = 'remember_me' in request.form
        print "!!", provider
        return oid.try_login(provider, ask_for = ['nickname', 'email']) #
    else:
        return render_template('login.html')

@oid.after_login
def after_login(resp):
    if resp.email is None or resp.email == "":
        flash('Invalid login. Please try again.')
        redirect(url_for('login'))
    user = User.query.filter_by(email = resp.email).first()
    if user is None:
        username = resp.nickname
        if username is None or username == "":
            username = resp.email.split('@')[0]
        user = User(username = username, email = resp.email, role = ROLE_USER)
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