from flask.ext.assets import Bundle

js_libs = Bundle(
    'js/lib/underscore-min.js',
    'js/lib/backbone-min.js',
    'css/bootstrap/js/bootstrap.min.js',
    'js/lib/typeahead.js',
    filters='jsmin',
    output='gen/js/libs.js'
)

brewsheet_js = Bundle(
    'js/lib/bootstrap-datepicker.js',
    'js/lib/typeahead.js',
    'js/lib/jquery.flot.js',
    'js/lib/jquery.flot.axislabels.js',
    'js/src/template_functions.js',
    'js/src/brew_calculator.js',
    'js/src/brewsheet_models.js',
    'js/src/brewsheet.js',
    filters='jsmin',
    output='gen/js/brewsheet.js'
)

js_ingredient_list = Bundle(
    'js/src/ingredient_list.js',
    filters='jsmin',
    output='gen/js/brewsheet.js'
)
