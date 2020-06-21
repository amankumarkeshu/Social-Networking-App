var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    LocalStrategy = require("passport-local"),
    passport = require("passport"),
    Posts = require("./models/posts"),
    Alumni = require("./models/alumni"),
    Comments = require("./models/comments"),
    request = require('request'),
    nodemailer = require('nodemailer'),
    twilio = require('twilio');
var config = require('./config/config.js');
var client = new twilio(config.twilio.accountSid, config.twilio.authToken);
var mongoUrl=config.uri.uri;
mongoose.connect(mongoUrl, { useUnifiedTopology: true, useNewUrlParser: true }); //create Posts and users inside mongodb

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.use(methodOverride("_method"));

///////////////////////////////////////////////////////////////////////////
// Passport setup 
app.use(require('express-session')({
    secret: "Once again rusty wins the cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(Alumni.authenticate()));
passport.serializeUser(Alumni.serializeUser());
passport.deserializeUser(Alumni.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});
////////////////////////////////////////////////////////////////////

app.get("/", function(req, res) {
    res.render("landing");
});

//INDEX ROUTE - show all Posts
app.get("/alumni", function(req, res) {
    // Get all Posts from DB
    Posts.find({}, function(err, allPosts) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {
                posts: allPosts
            }); //data + name passing in
        }
    });

});

//////////////////////////////////
//SEARCH Alumni
//////////////////////////////
app.get("/alumni/search", function(req, res) {
    Alumni.find({}, function(err, alumni) {
        if (err) {
            console.log("OOPS there's an error");
        } else {
            alumni.forEach(function(alumni_) {
              
            });
            res.render("search.ejs", { alumni: alumni });
        }

    });
    // res.render("search.ejs", { alumni: alumni });
});

app.post("/search", function(req, res) {

    var alumni = req.body;
    var query, query2;
    var name, batch,college;

    if (req.body.name) {
        query = req.body.name;
    } else {
        query = { name: { $exists: true } };
    }

    Alumni.find({ name: query}, function(err, alumni) {
        if (err) {
            console.log("OOPS there's an error");

        } else {
            alumni.forEach(function(alumni_) {
              
            });
            res.render("indexUser.ejs", { alumni: alumni });
        }

    });
});

//======================================================
//Send Email ROUTES
//=======================================================
app.get("/alumni/:id/email", function(req, res) {

    Alumni.findById(req.params.id, function(err, foundalumni) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that campground
            console.log(foundalumni);
            res.render("email", {
                alumni: foundalumni
            });
        }
    });

    // res.render("email.ejs", { alumni: alumni });
});

app.post("/alumni/:id/email", function(req, res) {
    //res.render("email.ejs");

    // kVGf8EzjWNdVEAPZnaGKPEhf27eSqCdIEVOJQzgp
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.mlab.username,
            pass: config.mlab.password
        }
    });
    const string1 = req.params;
    var subject = req.body.Subject;
    var text = req.body.text;

    Alumni.findById(req.params.id, function(err, foundalumni) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/alumni/" + foundalumni._id);

            var string = 'kumaramankeshu@gmail.com' + ', ' + 'sonalranisr88@gmail.com';

            var mailOptions = {
                from: 'kumaramankeshu@gmail.com',
                to: foundalumni.email,
                subject: subject,
                text: text
                    // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'        
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    });
});


//======================================================
//Send Message ROUTES
//======================================================
app.get("/alumni/:id/message", function(req, res) {
    Alumni.findById(req.params.id, function(err, foundalumni) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that campground
            console.log(foundalumni);
            res.render("message", {
                alumni: foundalumni
            });
        }
    });

});
app.post("/alumni/:id/message", function(req, res) {
    var sender = '+12562428531';
    var message = req.body.text;
    Alumni.findById(req.params.id, function(err, foundalumni) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/alumni/" + foundalumni._id);
            receiver = foundalumni.mobile;
            client.messages.create({
                    to: receiver,
                    from: sender,
                    body: message
                })
                .then(message => console.log(`
                 SMS sent to Alumni: $ {  }
                ` + message.sid))
                .catch((error) => {
                    console.log(error);
                });
        }
    })

});
//CREATE - add new Post to database
app.post("/posts", isLoggedIn, function(req, res) {
    //get data from form and add to thriftstore array
    // request('https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAPzLdcKEPCe4SQf3-cdSnq5vmh_MRaHCs' +

    //     '&address=' + encodeURIComponent(req.body.address),
    //     function(error, response, body) {
    //         if (error) {
    //             console.log('error!', error);
    //         } else {
    //             var data = JSON.parse(body);
    //             // console.log('data: ', util.inspect(data, { showHidden: false, depth: null }))

    //             if (data.results && data.results[0] && ["address_components"]) {
    //                 var addressComponents = data.results[0]["address_components"]
    //                 for (var i = 0; i < addressComponents.length; i++) {
    //                     if (
    //                         addressComponents[i]['types'].indexOf('sublocality_level_1') > -1 ||
    //                         addressComponents[i]['types'].indexOf('locality') > -1) {
    //                         var city = addressComponents[i]['long_name'];
    //                     }
    //                     if (addressComponents[i]['types'].indexOf('administrative_area_level_1') > -1) {
    //                         var state = addressComponents[i]['short_name'];
    //                     }
    //                     if (addressComponents[i]['types'].indexOf('country') > -1) {
    //                         var country = addressComponents[i]['long_name'];
    //                     }
    //                 }
    //             } else {
    //                 var city = null,
    //                     state = null,
    //                     country = null;
    //             }

                var newPost = {
                    name: req.body.name,
                    image: req.body.image,
                    description:req.body.description,
                    author: {
                        id: req.user._id,
                        username: req.user.username,
                        name: req.user.name
                    }
                };
                console.log(newPost);
                console.log(" \n");
                Posts.create(newPost, function(err, newlyCreated) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect("/alumni");
                    }
                });
            // }

        // });

});


//NEW - show form to create new Blog Post 
app.get("/posts/new", isLoggedIn, function(req, res) {
    res.render("new.ejs");
});

//SHOW - shows more info about campground selected - to be declared after NEW to not overwrite
app.get("/posts/:id", function(req, res) {
    //find the campground with the provided ID

    Posts.findById(req.params.id).populate("comments").exec(function(err, post) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that campground
            res.render("showPost", {
                post: post
            });
        }
    });
    
});

//SHOW - shows more info about campground selected - to be declared after NEW to not overwrite
app.get("/alumni/:id", function(req, res) {

    var posts=[];
   
    Posts.find({},function(err,found){
        if(err)
            console.log(err);
        else{
            found.forEach(function(f){
                if(f.author.id.equals(req.params.id))
                   { console.log(f);
                posts.push(f);}
            })
           
        }
    });

    //find the campground with the provided ID
    Alumni.findById(req.params.id, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that campground
            res.render("show", {
                alumni: foundUser,
                posts:posts
            });
        }
    });
});
//======================================================
//EDIT ROUTES
//=======================================================
app.get("/alumni/:id/edit", checkAuthorization, function(req, res) {
    Alumni.findById(req.params.id, function(err, foundalumni) {
        if (err) {
            console.log(err);
        } else {
            res.render("alumni/edit", { alumni: foundalumni });
        }
    });
});

// Add new Friend
app.put("/alumni/newfriend/:id/my/:id1",function(req,res){
    console.log(req.params.id+"\n"+req.params.id1);
    Alumni.findById(req.params.id1,function(err,found){
        if(err)
        {console.log(err);
          res.redirect("/alumni/"+req.params.id1);}
        else{
        console.log(found);
        if(  found && !found.friends.includes(req.params.id)){
            found.friends.push(req.params.id);
            found.save();
        }
            res.redirect("/alumni/"+req.params.id);}
    })
})

// Add new Friend

app.get("/posts/:id/edit", checkPostAuthorization, function(req, res) {

    Posts.findById(req.params.id, function(err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            res.render("alumni/editPost", { post: foundPost });
        }
    });
});


// Show Friends
app.get("/alumni/friends/:id",function(req,res){
    let friend=[];

    var friendSize=0;
    const promise1 = new Promise((resolve, reject) => {
        Alumni.findById(req.params.id,function(err,found){
            if(err)
            {
                console.log(err);
            }
            else{
            friendSize= found.friends.length;
            found.friends.forEach(function(f){
            Alumni.findById(f,function(err,f1){
                console.log(" Hi: " + f1.name);
                friend.push(f1);
                if( friend.length == friendSize){
                    resolve(friend.length ===friendSize);
                }   
            });
          
            });
            if( friend.length == friendSize){
                resolve(friend.length ==friendSize);
            }
            console.log(friend.length, friendSize);
            } 
         });
        });
      promise1.then((val) => {
        console.log(val);
        console.log(" My friends: " + friend);
        res.render("showFriends",{friends:friend});

      });

  });


//======================================================
//UPDATE ROUTES
//=======================================================
app.put("/alumni/:id", checkAuthorization, function(req, res) {
    Alumni.findByIdAndUpdate(req.params.id, req.body.alumni, function(err, updatedalumni) {
        if (err) {
            res.redirect("/alumni");
        } else {
            res.redirect("/alumni/" + req.params.id);
        }
    });
});

app.put("/posts/:id", checkPostAuthorization, function(req, res) {
    console.log(req.params.id);
    console.log(req.body.post);
    Posts.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost) {
        if (err) {
            res.redirect("/alumni");
        } else {

            res.redirect("/posts/" + req.params.id);
        }
    });
});


//======================================================
//comment ROUTES
//=======================================================


app.get("/posts/:id/comments/new", isLoggedIn, function(req, res) {
    Posts.findById(req.params.id, function(err, newPost) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/newComment", { post: newPost });
        }
    });

});

app.post("/posts/:id/comments", isLoggedIn, function(req, res) {
    console.log(req.params.id);
    Posts.findById(req.params.id, function(err, newPost) {
        if (err) {
            console.log(err);
            //res.redirect("/campegrounds/:id");
        } else {
            Comments.create(req.body.comment, function(err, comment) {
                if (err) {
                    //req.flash("error","Something Went Wrong");
                    console.log(err);
                } else {
                    //console.log(req.user);
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    newPost.comments.push(comment);
                    newPost.save();
                    //req.flash("Success","Comment Added");
                    res.redirect("/posts/" + req.params.id);
                }

            });
        }

    });
});

app.get("/posts/:id/comments/:comment_id/edit", checkComment, function(req, res) {
    Comments.findById(req.params.comment_id, function(err, newCom) {
        if (err) {
            console.log(err);
            //res.redirect("back");
        } else {

            res.render("comments/editComment", { post_id: req.params.id, comment: newCom });
        }
    });
});

app.put("/posts/:id/comments/:comment_id", checkComment, function(req, res) {
    Comments.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updCom) {
        if (err) {
            //res.redirect("back");
        } else {
            console.log(req.params.id);
            console.log(req.params.comment_id);
            res.redirect("/posts/" + req.params.id);
        }
    });
});

app.delete("/posts/:id/comments/:comment_id", checkComment, function(req, res) {
    Comments.findByIdAndRemove(req.params.comment_id, function(err, updCom) {
        if (err) {
            //res.redirect("back");
        } else {
            //req.flash("success","Comment Deleted Successfully");
            res.redirect("/posts/" + req.params.id);
        }
    });
});

//======================================================
//DESTROY ROUTE
//=======================================================
app.delete("/alumni/:id", checkAuthorization, function(req, res) {
    Alumni.findByIdAndRemove(req.params.id, function(err, newalumni) {
        if (err) {
            res.redirect("/alumni");

        } else {
            res.redirect("/alumni");
        }
    });
});

app.delete("/posts/:id", checkPostAuthorization, function(req, res) {
    Posts.findByIdAndRemove(req.params.id, function(err, newalumni) {
        if (err) {
            res.redirect("/alumni");

        } else {
            res.redirect("/alumni");
        }
    });
});

function checkAuthorization(req, res, next) {
    if (req.isAuthenticated()) {
        Alumni.findById(req.params.id, function(err, foundalumni) {
            if (err) {
                res.redirect("back");
            } else {
                console.log("Authorization:"+req.user._id +" "+ req.user.name);
                console.log(foundalumni);
                // next();
                if (foundalumni._id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });

    } else {
        res.redirect("back");
    }
}

function checkPostAuthorization(req, res, next) {
    if (req.isAuthenticated()) {
        Posts.findById(req.params.id, function(err, foundPost) {
            if (err) {
                res.redirect("back");
            } else {

                // next();
                if (foundPost.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });

    } else {
        res.redirect("back");
    }
}

function checkComment(req, res, next) {
    if (req.isAuthenticated()) {
        Comments.findById(req.params.comment_id, function(err, newCom) {
            if (err) {
                // req.flash("error","Comment not found!");
                // res.redirect("back");
            } else {
                if (newCom.author.id.equals(req.user._id)) {
                    next();
                } else {
                    // req.flash("error","Access Denied");
                    // res.redirect("back");
                }
            }
        });
    } else {
        // req.flash("error","Login Required!");
        // res.redirect("back");
    }
}

//======================================================
//AUTH ROUTES
//=======================================================

app.get("/register", function(req, res) {
    res.render("register");

});

//Handle user sign up
app.post("/register", function(req, res) {
    var newuser = new Alumni({ name:req.body.name ,username: req.body.username });
    
    Alumni.register(newuser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/alumni");
        });
    });
});

//LOGIN routes
app.get("/login", function(req, res) {
    res.render("login");

});

//HAndle login page
app.post("/login", passport.authenticate("local", {
    successRedirect: "/alumni",
    failureRedirect: "/login"

}), function(req, res) {

});

//LOGOUT ROUTE
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/alumni");
})


//Is login check for adding comments
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, function() {
    console.log(" Jai shree ram !! Social Networking server has started!");
});