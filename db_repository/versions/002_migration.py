from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
hop = Table('hop', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('name', String(length=140)),
    Column('alpha_acid', Float),
)

malt = Table('malt', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('name', String(length=140)),
    Column('color', String(length=140)),
)

yeast = Table('yeast', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('name', String(length=140)),
    Column('attenuation', Integer),
    Column('type', String(length=50)),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['hop'].create()
    post_meta.tables['malt'].create()
    post_meta.tables['yeast'].create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['hop'].drop()
    post_meta.tables['malt'].drop()
    post_meta.tables['yeast'].drop()
