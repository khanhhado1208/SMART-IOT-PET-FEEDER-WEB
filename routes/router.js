module.exports = (function() {
    'use strict';
    var router = require('express').Router();

    router.get("/", (req, res) => {
        res.render("home.ejs");
    });


    return router;
})();
