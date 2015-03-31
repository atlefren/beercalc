# -*- coding: utf-8 -*-
from xml.dom.minidom import parse, parseString
import codecs


def get_high_low(item):
    high = item.getElementsByTagName('high')[0].firstChild.nodeValue
    low = item.getElementsByTagName('low')[0].firstChild.nodeValue
    return float(high), float(low)


def create_insert(style):
    print style.get('name')
    sql =  '''INSERT INTO style("id", "name", "og_high", "og_low", "fg_low", "fg_high", "abv_low", "abv_high", "ibu_low", "ibu_high", "srm_low", "srm_high" ) VALUES ('%s', '%s', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);'''
    return sql % (
        style.get('id', 'null'),
        style.get('name', 'null'),
        style.get('og_high', 'null'),
        style.get('og_low', 'null'),
        style.get('fg_low', 'null'),
        style.get('fg_high', 'null'),
        style.get('abv_low', 'null'),
        style.get('abv_high', 'null'),
        style.get('ibu_low', 'null'),
        style.get('ibu_high', 'null'),
        style.get('srm_low', 'null'),
        style.get('srm_high', 'null')
    )


dom1 = parse('/home/atlefren/Downloads/xmlstyleguide/styleguide2008.xml')


stats = ['og', 'fg', 'ibu', 'srm', 'abv']

itemlist = dom1.getElementsByTagName('subcategory')

styles = []

for item in itemlist:
    id = item.attributes["id"].value
    name = item.getElementsByTagName('name')[0].firstChild.nodeValue
    stats_node = item.getElementsByTagName('stats')[0]
    style = {'id': id, 'name': name}
    for stat in stats:
        stat_node = stats_node.getElementsByTagName(stat)
        if stat_node:
            stat_node = stat_node[0]
            high, low = get_high_low(stat_node)
            style[stat + '_low'] = low
            style[stat + '_high'] = high
    styles.append(style)

with codecs.open('data/styles.sql', 'w', 'utf-8') as out:
    lines = [create_insert(style) + "\n" for style in styles]
    
    out.writelines(lines)
