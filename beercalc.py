from flask import Flask, render_template, url_for, request, Response, g
import simplejson
import sqlite3

app = Flask(__name__)

app.config.from_envvar('BREWCALC_SETTINGS', silent=True)

def connect_db():
    return sqlite3.connect(app.config['DATABASE'])

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    g.db.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/brews/')
def brews():

    brews = [
        {"id": 1, "name": "Svarte Faen #2"}
    ]

    return render_template('brews.html', brews=brews)

@app.route('/brewsheet/')
def brewsheet():
    return render_template('brewsheet.html')

@app.route('/brewsheet/<int:brew_id>')
def brewsheet_with_brew(brew_id):

    brew = "{'generalInformation':{'beer_name':'Svarte Faen #2','brewer':'Atle Sveen','beer_style':'Porter','wort_size':'5','batch_size':'4','computed_color':'47','computed_ibu':'33','actual_og':'1.056','fg':'1.012'},'malts':[{'quantity':'1000','percentage':83.3,'name':'Marris Otter','max_ppg':'38','color':'8'},{'quantity':'100','percentage':8.3,'name':'Pale Chocolate','max_ppg':'28','color':'423'},{'quantity':'100','percentage':8.3,'name':'Crystal Rye','max_ppg':'29','color':'150'}],'mashSchedule':[{'mash_time':'60','mash_temperature':'68'}],'hops':[{'quantity':'5','name':'Centennial','form':'pellets','alpha_acid':'7.8','boil_time':'60'},{'quantity':'5','name':'Summit','form':'pellets','alpha_acid':'18.5','boil_time':'10'}],'additives':[],'water':{'mashing_water':'4','sparging_water':'4'},'boil':{'boil_time':'60'},'fermentation':{'yeast_name':'Safeale S4','yeast_type':'dry','primary_fermentation_days':'14','primary_fermentation_temp':'30','secondary_fermentation_days':'','secondary_fermentation_temp':'','storage_days':'10','storage_temp':'30'},'additionalInformation':{'brew_date':'19.01.2013','bottle_date':'02.02.2013','filtered':false,'co2':'natural','comment':''}}"
    return render_template('brewsheet.html', brew=brew)

@app.route('/ingredients/malts/')
def find_malts():
    query = request.args.get('q', '')
    malts = [
            {"id": 1, "name": "Marris Otter", "max_ppg": 38, "color": 8},
            {"id": 2, "name": "Crystal Rye", "max_ppg": 29, "color": 150},
            {"id": 3, "name": "Pale Chocolate", "max_ppg": 28, "color": 423},
    ]

    res = [malt for malt in malts if query.lower() in malt['name'].lower()]

    return Response(simplejson.dumps(res), mimetype='application/json')


@app.route('/ingredients/malts/list/')
def all_malts():
    cur = g.db.execute('select id, name, max_ppg, color from malts order by id desc')
    malts = [dict(id=row[0], name=row[1], max_ppg=row[0], color=row[0]) for row in cur.fetchall()]

    #return simplejson.dumps(malts)
    return render_template('malt_list.html', malts=malts)

@app.route('/ingredients/hops/list/')
def all_hops():
    return render_template('hop_list.html')

if __name__ == '__main__':
    app.run()