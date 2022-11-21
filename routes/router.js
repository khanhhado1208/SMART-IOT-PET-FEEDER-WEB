module.exports = (function() {
    'use strict';
    const router = require('express').Router();

    router.get("/", (req, res) => {
        res.render("home.ejs");
    });

    router.get("/register", (req, res) => {
        res.render("register.ejs");
    });
    return router;
})();