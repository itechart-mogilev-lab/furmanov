const httpStatus = require("http-status");
const orderService = require("./orders.services");

module.exports.createOrder = (req, res, next) => {
  orderService
    .createOrder(req.body)
    .then(order => res.status(httpStatus.CREATED).json(order))
    .catch(err => next(err));
};

module.exports.getOrders = (req, res, next) => {
  console.log(req.user.role);
  if (req.user.role == "executor") {
    orderService
      .getExecutorOrders(req.user.id, req.query)
      .then(orders => {
        res.json(orders);
      })
      .catch(err => next(err));
  } else {
    console.log(req.user.role);
    orderService
      .getUserOrders(req.user.id, req.query)
      .then(orders => {
        res.json(orders);
        console.log(orders);
      })
      .catch(err => next(err));
  }
};

module.exports.deleteUserOrder = (req, res, next) => {
  orderService
    .deleteUserOrder(req.params.id, req.user.id)
    .then(order => {
      res.json(order);
      console.log("done");
    })
    .catch(err => console.log(err));
};

module.exports.updateOrderById = (req, res, next) => {
  orderService
    .updateOrderById(req.user.id, req.body)
    .then(order => {
      res.json(order);
      console.log("done");
    })
    .catch(err => console.log(err));
};
