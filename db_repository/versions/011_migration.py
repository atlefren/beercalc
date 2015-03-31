from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
style = Table('style', post_meta,
    Column('id', String(length=10), primary_key=True, nullable=False),
    Column('name', Text),
    Column('og_high', Float),
    Column('og_low', Float),
    Column('fg_low', Float),
    Column('fg_high', Float),
    Column('abv_low', Float),
    Column('abv_high', Float),
    Column('ibu_low', Float),
    Column('ibu_high', Float),
    Column('srm_low', Float),
    Column('srm_high', Float),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['style'].create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['style'].drop()
