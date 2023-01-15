const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../modules/order");
const Product = require("../modules/product");
const checkAuth = require("../middleware/check-auth")

router.get("/", (req, res, next) => {
  Order.find()
    .select("product quantity _id")
    .exec()
    .then((docs) =>
      res.status(200).json({
        count: docs.length,
        orders: docs.map((doc) => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
          };
        }),
      })
    )
    .catch((err) => res.status(500).json({ error: err }));
});

router.post("/",checkAuth, (req, res, next) => {
  Product.findById(req.body.productId)
    .then((product) => {
      if (!product) {
        res.status(500).json({ message: "product not found" });
      }
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        product: req.body.productId,
        quantity: req.body.quantity,
      });
      return order.save();
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "order placed for",
        order: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/:orderId",checkAuth, (req, res, next) => {
  Order.findById(req.params.orderId)
    .exec()
    .then((doc) => {
      res.status(200).json(doc);
    })
    .catch(err => res.status(500).json({ error: err }));
});

router.delete("/:orderId",checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Order.remove({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: " order deleted ",
        deleted_order: result
      });
    }).catch(err => res.status(500).json({error: err}))
});

module.exports = router;
