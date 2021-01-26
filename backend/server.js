import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt-nodejs";


const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/auth";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

/*
BACK
- SQL Injection for mongo
- bcrypt and access token
- try/catch in the backend
- Print error message from catch
FRONT
- Fetch to login
- Access Token in the frontend
- Github in groups
*/

const User = mongoose.model("User", {
  name: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex"),
    unique: true,
  },
});

//   PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

const authenticateUser = async (req, res, next) => {
  next();
};

// Sign-up
app.post("/users", async (req, res) => {
  try {
    const { name, password } = req.body;
    const SALT = bcrypt.genSaltSync(10)
    const user = await new User({ 
      name, 
      password: bcrypt.hashSync(password, SALT),
    }).save();
    res.status(200).json({ userId: user._id, accessToken: user.accessToken });
  } catch (err) {
    res.status(400).json({ message: "Could not create user", errors: err });

  }
});

// Login
app.post("/sessions", async (req, res) => {
  try{
    const {name, password } = req.body;
    const user = await User.findOne({name});
    if(user && bcrypt.compareSync(password, user.password)){
        res.status(200).json({ userId: user._id, accessToken: user.accessToken })
    }else{
      throw "User not found";
    }
  }catch(err){
    res.status(404).json({error:err})
  }
  res.status(501).send();
});



// Secure endpoint, user needs to be logged in to access this.
app.get("/users/:id", authenticateUser);
app.get("/users/:id", (req, res) => { });

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
