import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { error } from 'console';

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/auth';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 100,
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex'),
    unique: true,
  },
});

userSchema.pre('save', async function (next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  const salt = bcrypt.genSaltSync();
  user.password = bcrypt.hashSync(user.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

//   PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

const authenticateUser = async (req, res, next) => {
  try {
    const accessToken = req.header('Authorization');
    const user = await User.findOne({ accessToken });
    req.user = user;
  } catch (err) {
    const errorMessage = 'Please try logging in again';
    console.log(errorMessage);
    res.status(401).json({ error: errorMessage });
  }
  next();
};

// Sign-up
app.post('/users', async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await new User({
      name,
      password,
    }).save();
    res.status(200).json({ userId: user._id, accessToken: user.accessToken });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'Could not create user', errors: err });
  }
});

// Logout
app.post('/users/logout', authenticateUser);
app.post('/users/logout', async (req, res) => {
  try {
    req.user.accessToken = null;
    await req.user.save();
    res.status(200).json({ loggedOut: true });
  } catch (err) {
    res.status(400).json({ error: 'Could not logout' });
  }
});

// Login
app.post('/sessions', async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({ name });
    if (user && bcrypt.compareSync(password, user.password)) {
      // User has entered correct credentials
      user.accessToken = crypto.randomBytes(128).toString('hex');

      // Save new access token
      const updatedUser = await user.save();
      res.status(200).json({
        userId: updatedUser._id,
        accessToken: updatedUser.accessToken,
      });
    } else {
      throw 'User not found';
    }
  } catch (err) {
    res.status(404).json({ error: 'User not found' });
  }
});

// Get user specific information
app.get('/users/:id/secret', authenticateUser);
app.get('/users/:id/secret', async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId != req.user._id) {
      console.log(
        "Authenticated user does not have access to this secret.  It's someone else's!"
      );
      throw 'Access denied';
    }
    const secretMessage = `This is a secret message for ${req.user.name}`;
    res.status(200).json({ secretMessage });
  } catch (err) {
    res.status(403).json({ error: 'Access Denied' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
