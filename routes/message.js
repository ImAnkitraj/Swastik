var express = require('express');
var router = express.Router(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User = require("../models/user"),
    Child = require("../models/child"),
    Parent = require("../models/parent");

const Nexmo = require('nexmo');
var mailer = require('easy-email');
var path = require('path');
var fs = require('fs');
var nodemailer = require('nodemailer');

// mongoose.connect(process.env.LOCALDB, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
//     console.log("db connected in protect route");
// });

router.use(require("express-session")({
    secret: "secret!",
    resave: false,
    saveUninitialized: false
}));
router.use(passport.initialize());
router.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/", (req, res) => {
    res.send("Here is nothing for you go to index page")
})

router.get("/phonenos", (req, res) => {
    var phonenos = [];
    var today = req.query.date;
    console.log(today);
    Child.find({ "vaccinations.duedate": today }, (err, ward) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(ward);
            ward.forEach((child) => {
                if (child.Mphoneno) {
                    if (phonenos.indexOf(child.Mphoneno) === -1)
                        phonenos.push(child.Mphoneno);
                    console.log(child.Mphoneno);
                }
                if (child.Fphoneno) {
                    console.log(child.Fphoneno);
                    if (phonenos.indexOf(child.Fphoneno) === -1)
                        phonenos.push(child.Fphoneno);
                }
                console.log(phonenos)
            })
        }
    });
    setTimeout(() => {
        res.render("printnos", { contactnos: phonenos });
    }, 1000);
});

router.get("/whatsapp", (req, res) => {
    var phonenos = [];
    var today = req.query.date;
    console.log(today);
    Child.find({ "vaccinations.duedate": today }, (err, ward) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(ward);
            ward.forEach((child) => {
                if (child.Mphoneno) {
                    if (phonenos.indexOf(child.Mphoneno) === -1)
                        phonenos.push(child.Mphoneno);
                    console.log(child.Mphoneno);
                }
                if (child.Fphoneno) {
                    console.log(child.Fphoneno);
                    if (phonenos.indexOf(child.Fphoneno) === -1)
                        phonenos.push(child.Fphoneno);
                }
                console.log(phonenos)
            })
        }
    });
    setTimeout(() => {
        res.render("whatsappnos", { contactnos: phonenos });
    }, 1000);
});

router.get("/phonenos/all_parents/:pincode", (req, res) => {
    var phonenos = [];
    var today = req.query.date;
    console.log(today);
    Child.find({ "address.pincode": req.params.pincode }, (err, ward) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(ward);
            ward.forEach((child) => {
                if (child.Mphoneno) {
                    if (phonenos.indexOf(child.Mphoneno) === -1)
                        phonenos.push(child.Mphoneno);
                    console.log(child.Mphoneno);
                }
                if (child.Fphoneno) {
                    console.log(child.Fphoneno);
                    if (phonenos.indexOf(child.Fphoneno) === -1)
                        phonenos.push(child.Fphoneno);
                }
                console.log(phonenos)
            })
        }
    });
    setTimeout(() => {
        res.render("phonenos", { contactnos: phonenos });
    }, 1000);
});

const nexmo = new Nexmo({
    apiKey: '0d4daa02',
    apiSecret: 'SAHw2cuS28PlWHNQ'
}, { debug: true });


router.post('/sendtoall', (req, res) => {
    console.log("Reached");
    var arr = req.body.contactnos.split(',');
    console.log(arr);
    var msg = req.body.msg;
    for (var number in arr) {
        arr[number] = "91" + arr[number];
        console.log(arr[number]);
        nexmo.message.sendSms(
            '918957790795', arr[number], msg, { type: 'unicode' },
            (err, responseData) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.dir(responseData);
                }
            });
    }
    res.render('effect.ejs', { contactnos: arr });

});


// const { MessagingResponse } = require('twilio').twiml;
// const accountSid = 'AC63dcb9c07e6cd8596c032a8ff5e59b1f';
// const authToken = '8006f3f18dda3891ff9e6c10f899f393';
// const client = require('twilio')(accountSid, authToken);
// const goodBoyUrl = 'https://lh3.googleusercontent.com/proxy/7q7Wx47mCOpMZC0_1j2RQNnNq7HEgCk5sjzIsyMw_meUpr2Xbyoy8BuyI1JFuAUU3gTrmyM2py04BPttN979w-c775WUwtyFwh6JQqHNG6GC0ZYNkiiBLKpPsB9xikmAm_1CWBDpBXwamn_Y-z_1BWmWXPWWBmqAZnJ6FbhuIPsCNAKO';


router.post('/sendwhatsapptoall', (req, res) => {
    const linkimg = req.body.link;
    const message = req.body.message;
    // var contacts = req.body.contacts;
    var arr = req.body.contactnos.split(',');
    console.log(arr);

    arr.forEach((nos) => {
        var str = "whatsapp:+91" + nos;
        console.log(str);
        client.messages.create({
            to: str,
            from: "whatsapp:+14155238886",
            body: message,
            mediaUrl: linkimg
        }).then(message => {
            console.log(message.sid);
        }).catch(err => console.log(err));
    })
    res.render('effect.ejs', { contactnos: arr });
});


const { MessagingResponse } = require('twilio').twiml;
const accountSid = 'AC49280ab194cc76ba75d4783d5f68a391';
const authToken = 'e1b3f04e85ef2fab83a317d21212227d';
const client = require('twilio')(accountSid, authToken);
const goodBoyUrl = 'https://lh3.googleusercontent.com/proxy/7q7Wx47mCOpMZC0_1j2RQNnNq7HEgCk5sjzIsyMw_meUpr2Xbyoy8BuyI1JFuAUU3gTrmyM2py04BPttN979w-c775WUwtyFwh6JQqHNG6GC0ZYNkiiBLKpPsB9xikmAm_1CWBDpBXwamn_Y-z_1BWmWXPWWBmqAZnJ6FbhuIPsCNAKO';


router.post('/sendwhatsapptoall', (req, res) => {
    const linkimg = req.body.link;
    const message = req.body.message;
    // var contacts = req.body.contacts;
    var arr = req.body.contactnos.split(',');
    console.log(arr);
    arr.forEach((nos)=>{
        client.messages.create({
            to: "whatsapp:"+nos+"",
            from: "whatsapp:+14155238886",
            body: message,
            mediaUrl: linkimg
        }).then(message => {
            console.log(message.sid);
        }).catch(err => console.log(err));
    })
    res.render('effect.ejs',{contactnos:arr});
});

router.post('/sendmailtoall', (req, res) => {
    var arr = req.body.contactnos.split(',');
    var msg = req.body.msg;
   // res.send("Work under progress!!");
    //console.log("emails : ");
    res.redirect('/admin');
    for(var i=0;i<arr.length;i++)
    {
    console.log(arr[i]);
    mailer.send_email(res,'/',"Swastik Portal","gadarsh780@gmail.com","zinfwpjphbywlekm",arr[i],"Swastik",msg,'','');
    }//for
});

router.get("/email", (req, res) => {
    var email = [];
    var today = req.query.date;
    console.log(today);
    Child.find({ "vaccinations.duedate": today }, (err, ward) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(ward);
            ward.forEach(child => {
                if (child.Mphoneno) {
                    console.log("M" + child.Mphoneno);
                    setTimeout(() => {
                        Parent.findOne({ "phoneno": child.Mphoneno }, (err, parent) => {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log("M" + parent);
                                if (email.indexOf(parent.email) === -1)
                                    email.push(parent.email);
                            }
                        });
                    }, 100);
                }
                if (child.Fphoneno) {
                    console.log("F" + child.Fphoneno);
                    setTimeout(() => {
                        Parent.findOne({ "phoneno": child.Fphoneno }, (err, parent) => {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log("F" + parent);
                                if (email.indexOf(parent.email) === -1)
                                    email.push(parent.email);
                            }
                        });
                    }, 200)
                }
                console.log(email)
            });
        }
    });
    setTimeout(() => {
        res.render("emailnos", { contactnos: email });
    }, 500);
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;