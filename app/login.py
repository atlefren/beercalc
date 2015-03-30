from flask import redirect, url_for, session, request
from flask.ext.login import logout_user, login_user
from flask_googlelogin import USERINFO_EMAIL_SCOPE

from app import app, db, lm, googlelogin
from models import User, ROLE_USER


@app.route("/login")
def login():
    return redirect(
        googlelogin.login_url(scopes=[USERINFO_EMAIL_SCOPE])
    )


lm.unauthorized_handler(login)


@app.route('/logout')
def logout():
    logout_user()
    session.clear()
    return redirect(url_for('index'))


@lm.user_loader
def load_user(userid):
    return User.query.get(int(userid))


@app.route('/oauth2callback')
@googlelogin.oauth2callback
def create_or_update_user(token, userinfo, **params):
    if params.get('error', False):
        return redirect(url_for('index'))

    user = User.query.filter_by(email=userinfo['email']).first()
    if user:
        user.name = userinfo['name']

    else:
        user = User(
            name=userinfo['name'],
            email=userinfo['email'],
            username=userinfo['email'].split('@')[0].replace('.', ''),
            role=ROLE_USER
        )
    db.session.add(user)
    db.session.commit()
    login_user(user)
    return redirect(request.args.get('next') or url_for('index'))
