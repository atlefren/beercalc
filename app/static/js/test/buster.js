var config = module.exports;

config["My tests"] = {
    env: "browser",
    rootPath: "../",
    libs: [
        "lib/underscore-min.js",
        "lib/*.js"
    ],
    sources: [
        "src/brew_calculator.js",
        "src/brewsheet_models.js",
        "src/*.js"
    ],
    tests: [
        "test/*-test.js"
    ]
};

