import os
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'postgresql://localhost:5432/beercalc')
SQLALCHEMY_MIGRATE_REPO = 'db_repository'
