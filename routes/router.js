module.exports = (function() {
    'use strict';
    var router = require('express').Router()
    const crypto = require('crypto')
    const User = require('../models/Users')
    const FeederSetup = require('../models/feeder-setup')
    var session

    // GET main page
    router.get("/", (req, res) => {
        const sesh = req.session
        if(sesh.userid){ // if there is an active session with userid
            res.render("dashboard.ejs", { username: sesh.userid})
        }else{
            res.render("home.ejs")
        }
    });

    //TODO: convert feeding time string to number

    /* This route sends the schedule data to server */
    router.post('/schedule', async (req,res) => {
        const mode = req.body.mode      // mode of feeder
        const perday = req.body.perday  // how many feedings per day
        const size = req.body.size      // portion size

        // populate times[] with dates of feeding
        var times = [req.body.first]
        if(perday>=2){
            times.push(req.body.second);
        }
        if(perday==3){
            times.push(req.body.third);
        }
        console.log("times: "+times)

        if(mode=="auto"){
            await FeederSetup.updateOne({username:session.userid}, {mode:true, portionsize:null, portionTime:[]}, {upsert:true})
        }else{ //scheduled mode
            await FeederSetup.updateOne({username:session.userid}, {$set: {mode:true, portionSize:size, portionTime:times}}, {upsert:true})
        }

        res.redirect("/")
    })


    // POST login form
    router.post('/login', async (req,res) => {
        var login = await Authorizer(req.body.username, req.body.password);

        if(login != null){
            session=req.session
            session.userid=login
            res.redirect("/")
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
            if (!(await checkUser(req.body.username))) { //check if username is taken
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
     * @function checkUser
     * @description Checks whether the user exists or not
     * @return {object} returns if user exists(true) or not(false)
     **/
    async function checkUser(username) {
        let exists = false;
        await User.findOne({ username: username }).then(user => {
            if (user) {
                exists = true;
            }
        })
        .catch(err => {
            console.log(err);
        });

        return exists;
    }    

    /** NOT IN USE NOW MIGHT DELETE LATER
     * @function checkUserData
     * @description Checks whether the user exists or not
     * @return {object} returns if user exists(true) or not(false)
     **/
    /*
    async function checkUserData(username) {
        let exists = false;
        await FeederSetup.findOne({ username: username }).then(username => {
            if (username) {
                exists = true;
            }
        })
        .catch(err => {
            console.log(err);
        });

        return exists;
    }*/
    return router;
})();