const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // for encrypting password
const jwt = require("jsonwebtoken"); // web token
require('dotenv').config()

const User = require("../modules/user");

router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        res.status(409).json({ message: "email already exists" });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
            });
            user
              .save()
              .then((result) => {
                res.status(201).json({ message: "user created", result });
                console.log(result);
              })
              .catch((err) => {
                res.status(500).json({ error: err });
                console.log(err);
              });
          }
        });
      }
    })
    .catch((err) => res.status(500).json({ error: err }));
});

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({ message: "Auth failed" });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({ message: "Auth failed" });
        }
        if (result) {
            console.log("the key is ",process.env.JWT_KEY);
          const token = jwt.sign(
            { email: user[0].email, userId: user[0].password },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
          );
          console.log(token);
          return res
            .status(200)
            .json({ message: "Auth successful", token: token });
        }
        res.status(401).json({ message: "Auth failed" });
      });
    });
});

router.delete("/:userId", (req, res, next) => {
  const id = req.params.userId;
  User.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({ message: "user deleted" });
    })
    .catch((err) => {
      res.status(500).json({ error: err }), console.log(err);
    });
});

module.exports = router;
