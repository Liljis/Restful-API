const express = require("express");
const router = express.Router();
const Product = require("../modules/product");
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth")
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random())
    cb(null, uniqueSuffix+ '-'+ file.originalname )
  }
})
/*
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  )
    cb(null, true);
  else cb(null, false);
};*/
const upload = multer({
  storage: storage
});

router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        products: docs.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/",
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log("error while getting ");
      res.status(500).json({ error: err });
    });
});

router.post("/",checkAuth, upload.single("productImage"), (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "created product succesfully",
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.log("comming from post -> "+err);
      res.status(500).json({ error: err });
    });
});

router.get("/:productId",checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .exec()
    .then((doc) => {
      console.log(doc);
      if (doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: "GET",
            url: "https://localhost:3000/products/" + doc._id,
          },
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found in the provided id" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:productId",checkAuth, (req, res, next) => {
  const id = req.params.productId;
  const updateOpt = {};
  for (const opt of req.body) {
    updateOpt[opt.propName] = opt.value;
  }
  Product.updateOne({ _id: id }, { $set: updateOpt })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "product updated",
        request: {
          type: "GET",
          url: "htpp://localhost:3000/product/" + id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete("/:productId",checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.remove({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "product deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/product/",
          body: {
            name: "String",
            price: "Number",
          },
        },
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

module.exports = router;
