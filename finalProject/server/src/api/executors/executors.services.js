const jwt = require("jsonwebtoken");
const config = require("../../config/environment");
const Executor = require("../../models/executor.model");
const Comment = require("../../models/comment.model");
const service = require("../../services/calculateValues.service");
const mailService = require("../../services/mail.service.js");

async function register(data) {
  const {
    logo,
    name,
    email,
    discription,
    address,
    services,
    orders,
    password,
    role = "executor",
    emailConfirmed = false,
    averageRate = 0
  } = data;
  let averagePrice = service.averagePrice(services);

  const token = jwt.sign({ id: email }, config.jwt.secret, {
    expiresIn: config.jwt.expiration
  });

  const executor = new Executor({
    logo,
    name,
    email,
    emailConfirmed,
    verifyToken: token,
    averageRate,
    discription,
    address,
    averagePrice,
    blocking: {
      isBLocked: false,
      reason: ""
    },
    services,
    orders,
    password,
    role
  });
  await executor.save();
  const savedExecutor = await Executor.findOne({ name, email });
  const savedData = savedExecutor.toObject();
  mailService.registerMailForExecutor(
    savedData.verifyToken,
    savedData.name,
    savedData.email
  );
  const { password: executorPassword, ...executorWithoutPassword } = savedData;
  return {
    executor: executorWithoutPassword
  };
}

async function confirm({ verifyToken }) {
  const executor = await Executor.findOne({ verifyToken });
  if (executor === null) throw new Error("Executor not found");

  if (executor.verifyToken === verifyToken) {
    await Executor.findOneAndUpdate(
      { verifyToken },
      {
        $set: {
          emailConfirmed: true
        },
        $unset: {
          verifyToken: { $exist: true }
        }
      }
    );

    const token = jwt.sign(
      { id: executor._id, role: executor.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiration }
    );
    const data = executor.toObject();
    const { password: executorPassword, ...executorWithoutPassword } = data;

    return {
      token: token,
      executor: executorWithoutPassword
    };
  }
}

async function loadExecutor(executor) {
  const data = executor.toObject();
  const { password: executorPassword, ...executorWithoutPassword } = data;

  return {
    executor: executorWithoutPassword
  };
}

async function authenticate({ name, password }) {
  const executor = await Executor.findOne({ name });

  if (executor === null) throw new Error("Executor not found");
  if (executor.emailConfirmed === false)
    throw new Error("Executor not confirmd");

  let success = await executor.comparePassword(password);

  if (success === false) throw new Error("Password is incorrect");

  const token = jwt.sign(
    {
      id: executor._id,
      role: executor.role
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiration }
  );
  if (executor.blocking.isBlocked) {
    return {
      name: executor.name,
      isBlocked: executor.blocking.isBlocked,
      reason: executor.blocking.reason
    };
  }

  return {
    token: token,
    executor: executor
  };
}

async function get({
  page,
  perPage,
  search,
  sortByPrice,
  sortByAddress,
  sortByRate,
  sortByPopularity
}) {
  let nameReg = "";
  let addressReg = "";

  if (search === "" || search === null || search === undefined) {
    nameReg = ".*";
  } else {
    nameReg = `.*${search}.*`;
  }

  if (sortByAddress === "") {
    addressReg = ".*";
  } else {
    addressReg = `.*${sortByAddress}.*`;
  }

  let averagePrice = sortByPrice !== "" ? sortByPrice : 0;
  let popularity = sortByPopularity !== "" ? sortByPopularity : 0;
  const query = {
    emailConfirmed: true,
    name: { $regex: nameReg, $options: "i" },
    address: { $regex: addressReg, $options: "i" }
  };
  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(perPage, 10) || 5,
    select:
      "name email emailConfirmed blocking discription role _id services averageRate averagePrice",
    sort: { averagePrice: averagePrice, popularity: popularity }
  };

  const executors = await Executor.paginate(query, options);

  return executors;
}

async function blockExecutor(_id, { reason }) {
  const updatedExecutor = await Executor.findByIdAndUpdate(
    _id,
    { $set: { "blocking.isBlocked": true, "blocking.reason": reason } },
    { new: true }
  );
  const data = updatedExecutor.toObject();
  mailService.mailForBlockExecutor(data.name, data.email, data.blocking.reason);
  const { password: executorPassword, ...executorWithoutPassword } = data;
  return executorWithoutPassword;
}

async function unblockExecutor(_id) {
  const updatedExecutor = await Executor.findByIdAndUpdate(
    _id,
    { $set: { "blocking.isBlocked": false, "blocking.reason": "" } },
    { new: true }
  );
  const data = updatedExecutor.toObject();
  mailService.mailForUnBlockExecutor(data.name, data.email);
  const { password: executorPassword, ...executorWithoutPassword } = data;
  return executorWithoutPassword;
}

async function editExecutor(
  _id,
  { name, discription, password, services, address }
) {
  const executor = await Executor.findOne({ _id });
  let averagePrice = services ? service.averagePrice(services) : 0;
  let savedExecutor = {};
  if (password) {
    let unchangedPassword = await executor.comparePassword(password);
    if (unchangedPassword) {
      savedExecutor = await Executor.findByIdAndUpdate(
        _id,
        {
          $set: {
            name: name ? name : executor.name,
            discription: discription ? discription : executor.discription,
            services: services ? services : executor.services,
            address: address ? address : executor.address,
            averagePrice: averagePrice ? averagePrice : executor.averagePrice
          }
        },
        { new: true }
      );
    } else {
      executor.name = name ? name : executor.name;
      executor.discription = discription ? discription : executor.discription;
      executor.services = services ? services : executor.services;
      executor.address = address ? address : executor.address;
      executor.password = password;
      executor.averagePrice = averagePrice
        ? averagePrice
        : executor.averagePrice;
      savedExecutor = await executor.save();
    }
  } else {
    savedExecutor = await Executor.findByIdAndUpdate(
      _id,
      {
        $set: {
          name: name ? name : executor.name,
          discription: discription ? discription : executor.discription,
          services: services ? services : executor.services,
          address: address ? address : executor.address,
          averagePrice: averagePrice ? averagePrice : executor.averagePrice
        }
      },
      { new: true }
    );
  }
  const data = savedExecutor.toObject();
  const { password: executorPassword, ...executorWithoutPassword } = data;
  return executorWithoutPassword;
}

async function postComment(executor_id, data) {
  const { userName, userComment } = data;
  const comment = new Comment({
    userName,
    comment: userComment,
    executorId: executor_id
  });
  const savedComment = comment.save().then(({ _id }) => Comment.findById(_id));
  await Executor.findOneAndUpdate(
    { _id: executor_id },
    {
      $push: {
        comments: savedComment
      }
    }
  );
  return savedComment;
}

async function getExecutorComments(executor_id, req_query) {
  const { page, perPage } = req_query;
  const query = {
    executorId: executor_id
  };
  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(perPage, 10) || 5,
    select: "userName comment created_at",
    sort: { created_at: -1 }
  };
  const comments = await Comment.paginate(query, options);
  console.log(comments);
  return comments;
}

module.exports = {
  get,
  blockExecutor,
  unblockExecutor,
  editExecutor,
  authenticate,
  loadExecutor,
  register,
  confirm,
  postComment,
  getExecutorComments
};
