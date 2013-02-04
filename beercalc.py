from flask import Flask, render_template, url_for
import simplejson

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/brewsheet/')
def brewsheet():
    return render_template('brewsheet.html')

@app.route('/ingredients/malts/')
def malts():
    malts = [
            {"id": 1, "name": "Marris Otter", "max_ppg": 38, "color": 8},
            {"id": 2, "name": "Crystal Rye", "max_ppg": 29, "color": 150},
            {"id": 3, "name": "Pale Chocolate", "max_ppg": 28, "color": 423},
    ]


    return simplejson.dumps(malts)

if __name__ == '__main__':
    app.run()