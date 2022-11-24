module.exports = (function() {
    'use strict';
    var router = require('express').Router()
    const crypto = require('crypto')
    const User = require('../models/Users')
    
    var session
    // GET main page
    router.get("/", (req, res) => {
        session=req.session;
        if(session.userid){ // if there is an active session with userid
            //res.send("Hey there, welcome "+login+". <a href=\'/logout'>click to logout</a>")
            res.render("dashboard.ejs")
        }else{
            res.render("home.ejs")
        }
    });

    // POST login form
    router.post('/login', async (req,res) => {
        var login = await Authorizer(req.body.username, req.body.password);

        if(login != null){
            session=req.session
            session.userid=login
            console.log("Session: "+req.session)
            // res.send("Hey there, welcome "+login+". <a href=\'/logout'>click to logout</a>")
            res.render("dashboard.ejs", { username: login})
        }else{
            res.send('Invalid username or password')
        }
    })

    // log out of session
    router.get('/logout',(req,res) => {
        req.session.destroy();
        res.redirect('/');
    });

    // GET register page
    router.get("/register", (req, res) => {
        res.render("register.ejs")
    });

    /* POST register form */
    router.post("/register", async (req, res) => {
        crypto.pbkdf2(req.body.password, "saltysalt", 200000, 64, "sha512", async (err, pbkdf2Key) => {
            if (err) throw err;
            if (!(await checkUsername(req.body.username))) { //check if username is taken
            const response = await User.create({
                username: req.body.username,
                password: pbkdf2Key.toString("hex")
            });
            console.log("User created successfully: ", response);
            res.redirect("/"); //redirect to homepage
            }else{
                res.send("Username already taken. <a href=\'/register'>click to register again</a>");
            }
        });
    });


    // Functions

    /**
     * @function Authorizer
     * @parameters receives the username and password from login form
     * @description finds if username with given password exists in database
     * @return username or null
     **/
    async function Authorizer(username, password) {
        var returnable;

        const key = crypto.pbkdf2Sync(password, "saltysalt", 200000, 64, "sha512") // hash password to encrypted version
        const userQuery = await User.findOne({
            username: username,
            password: key.toString("hex"),
        }).then((user) => {
            if (user) {
                returnable = username;
            } else {
                returnable = null;
            }
        }).catch((err) => {
            returnable = null; //error
        });
        return returnable;
    }

    /**
     * @function checkUsername
     * @description Checks whether the username is taken or not
     * @return {object} returns if username is taken(true) or not(false)
     **/
    async function checkUsername(username) {
        let taken = false;
        await User.findOne({ username: username }).then(user => {
            if (user) {
                taken = true;
            }
        })
        .catch(err => {
            console.log(err);
        });

        return taken;
    }

    
    return router;
})();

