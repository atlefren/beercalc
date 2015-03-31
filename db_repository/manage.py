#!/usr/bin/env python
import os
from migrate.versioning.shell import main

if __name__ == '__main__':
    db_url = os.environ.get('DATABASE_URL', 'postgresql://localhost:5432/beercalc')
    db_url = db_url.replace('postgres:', 'postgresql:', 1)
    main(url=db_url, debug='False', repository='db_repository')
