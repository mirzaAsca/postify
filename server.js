const expressHandlebars = require("express-handlebars").engine;
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const express = require("express");
const moment = require("moment");

const app = express();

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://ascamirza:WAaDPs3jRTmlvLcs@cluster0.4csusgz.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Passport Config
require("./config/passport")(passport);

// Express body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Express session
app.use(
  session({ secret: "mySecret", resave: false, saveUninitialized: false })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash for flash messages
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Global variable for user
app.use((req, res, next) => {
  console.log("Middleware User: ", req.user);
  res.locals.user = req.user || null;
  next();
});

// Method override for PUT and DELETE forms
app.use(methodOverride("_method"));

// Define formatDate and eq helpers
const helpers = {
  formatDate: function (date) {
    return moment(date).format("MMMM Do YYYY");
  },
  eq: function (arg1, arg2) {
    const result = arg1.toString() == arg2.toString();
    console.log(`Comparing ${arg1} and ${arg2}: ${result}`);
    return result;
  },
  log: function (value) {
    console.log("View Value: ", value);
  },
};

// Handlebars
app.engine(
  "handlebars",
  expressHandlebars({
    defaultLayout: "main",
    helpers: helpers,
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
    },
  })
);

app.set("view engine", "handlebars");

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
