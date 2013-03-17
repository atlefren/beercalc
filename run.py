##!venv/bin/python

import os
from app import app

app.secret_key = os.environ.get('SECRET_KEY', 'development_fallback')

port = int(os.environ.get('PORT', 5000))
app.run(debug=True, host='0.0.0.0', port=port)