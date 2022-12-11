module.exports = (function() {
    'use strict';
    const router = require('express').Router()
    const crypto = require('crypto')
    const mqtt = require('mqtt');
    const User = require('../models/Users')
    const FeederSetup = require('../models/feeder-setup')
    const Readings = require('../models/Live-data')
    let session

    /* MQTT setup */
    const pub_topic = "handajun/"
    const sub_topic = "handajun/data"
    const address = 'mqtt://public.mqtthq.com:1883'; //public mqtt broker
    const client = mqtt.connect(address);

    client.on("connect", function (err) {
        client.subscribe(sub_topic);
        console.log("Server subscribed to mqtt");
    });
    client.on("message", async function (topic, message) {
        const live_data=JSON.parse(message)
        console.log(live_data)
        await Readings.updateOne({device_ID:live_data.device_ID}, {weight:live_data.weight}, {upsert:true})
    });


    // GET main page
    router.get("/", async (req, res) => {
        const sesh = req.session
        if(sesh.userid){ // if there is an active session with userid

            let weight
            const device = await getDevice(sesh.userid)
            if(device!=null){
                weight = await getReading(device)
            }
            res.render("dashboard.ejs", { username: sesh.userid, reading: weight})
        }else{
            res.render("home.ejs")
        }
    });

    // GET about us page
    router.get("/about", (req, res) => {
        const sesh = req.session
        if(sesh.userid){ // if there is an active session with userid
            res.render("aboutUs.ejs", { username: sesh.userid})
        }else{
            res.render("home.ejs")
        }
    });

    // GET settings page
    router.get("/settings", async (req, res) => {

        const sesh = req.session
        if(sesh.userid){ // if there is an active session with userid
            const device_ID = await getDevice(session.userid)
            res.render("settings.ejs", { username: sesh.userid, device_ID: device_ID})
        }else{
            res.render("home.ejs")
        }
    });

    /* This route sends the schedule data to server */
    router.post('/schedule', async (req,res) => {
        const perday = req.body.perday  // how many feedings per day
        const size = req.body.size      // portion size
        let mode                        // mode of feeder
        if(req.body.mode=="auto"){
            mode=true;
        }else{
            mode=false
        }

        // populate times[] with dates of feeding
        let times = [req.body.first]
        if(perday>=2){
            times.push(req.body.second)
        }
        if(perday==3){
            times.push(req.body.third)
        }
        console.log("times: "+times)

        // send to database
        if(mode){ // automatic feeding
            await FeederSetup.updateOne({username:session.userid}, {mode:true, portionsize:null, portionTime:[]}, {upsert:true})
        }else{ //scheduled mode
            await FeederSetup.updateOne({username:session.userid}, {$set: {mode:false, portionSize:size, portionTime:times}}, {upsert:true})
        }


        // publish on mqtt
        const user = await User.findOne({username: session.userid});
        const info=JSON.stringify({
            mode:mode,
            size:size,
            times:times
        })
        const topic = pub_topic+user.device_ID
        client.publish(topic, info)
        console.log(`Send '${info}' to topic '${topic}'`)

        res.redirect("/")
    })

    // POST login form
    router.post('/login', async (req,res) => {
        const login = await Authorizer(req.body.username, req.body.password);

        if(login != null){
            session=req.session
            session.userid=login
            res.redirect("/")
        }else{
            res.send('Invalid username or password')
        }
    })

    // POST settings
    router.post('/settings', async (req,res) => {
        
        if(req.body.type == "id"){
            await User.updateOne({username: session.userid}, {device_ID:req.body.id})
        }else{
            crypto.pbkdf2(req.body.password, "saltysalt", 200000, 64, "sha512", async (err, pbkdf2Key)=>{
                if(err) throw err
                const response = await User.updateOne({username: session.userid}, {password:pbkdf2Key.toString("hex")})
                console.log("Password changed successfully: ", response);
            })
        }
       
        res.redirect("/") //todo: redirect to "changes successfully saved"
    })

    // POST feed now
    router.post('/feednow', async (req,res) => {
       // publish on mqtt
       const user = await User.findOne({username: session.userid});
       const info="feed"
       const topic = pub_topic+user.device_ID
       client.publish(topic, info)
       console.log(`Send '${info}' to topic '${topic}'`)

        res.redirect("/") //todo: redirect to "changes successfully saved"
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
        console.log("in reg post req: " + req.body.username + ", " + req.body.password)
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
        let returnable;

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
     * @return {Boolean} returns if user exists(true) or not(false)
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

    /**
     * @function getDevice
     * @return {String} returns device ID of user
     **/
    async function getDevice(username) {
        const query = await User.findOne({ username: username })
        const device_ID = query.device_ID;
        return device_ID
    }

    /**
     * @function getReading
     * @return {Number} returns amount of food in device's bowl
     **/
    async function getReading(device_ID) {
        const query = await Readings.findOne({ device_ID: device_ID })
        if(query!=null){
            return query.weight
        }
        return null;
    }

    return router;
})();

// TODO: convert feeding time string to number