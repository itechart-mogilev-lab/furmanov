const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-paginate");

const schema = new mongoose.Schema(
  {
    logo: { type: String },
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    emailConfirmed: { type: Boolean, required: true },
    verifyToken: { type: String },
    blocking: {
      isBlocked: { type: Boolean, default: false },
      reason: { type: String, default: "" }
    },
    discription: { type: String, required: true },
    address: { type: String },
    averagePrice: { type: Number, required: true },
    averageRate: { type: Number },
    orders: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: false }
    ],
    password: { type: String, required: true },
    role: { type: String, required: false, lowercase: true },
    rate: [
      {
        customer_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
          required: false
        },
        rate: { type: Number, required: false, default: 0 }
      }
    ],
    comments: [
      {
        commentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment",
          required: false
        }
      }
    ],
    popularity: {
      type: Number,
      required: false,
      default: 0
    },
    services: {
      standart: {
        smallRoom: { type: Number, required: false, default: 0 },
        largeRoom: { type: Number, required: false, default: 0 },
        toilet: { type: Number, required: false, default: 0 }
      },
      general: {
        smallRoom: { type: Number, required: false, default: 0 },
        largeRoom: { type: Number, required: false, default: 0 },
        toilet: { type: Number, required: false, default: 0 }
      },
      afterRepair: {
        smallRoom: { type: Number, required: false, default: 0 },
        largeRoom: { type: Number, required: false, default: 0 },
        toilet: { type: Number, required: false, default: 0 }
      },
      carpetDryCleaning: {
        smallRoom: { type: Number, required: false, default: 0 },
        largeRoom: { type: Number, required: false, default: 0 },
        toilet: { type: Number, required: false, default: 0 }
      },
      office: {
        smallRoom: { type: Number, required: false, default: 0 },
        largeRoom: { type: Number, required: false, default: 0 },
        toilet: { type: Number, required: false, default: 0 }
      },
      furniture: {
        smallRoom: { type: Number, required: false, default: 0 },
        largeRoom: { type: Number, required: false, default: 0 },
        toilet: { type: Number, required: false, default: 0 }
      },
      industrialСleaning: {
        smallRoom: { type: Number, required: false, default: 0 },
        largeRoom: { type: Number, required: false, default: 0 },
        toilet: { type: Number, required: false, default: 0 }
      },
      pool: {
        smallRoom: { type: Number, required: false, default: 0 },
        largeRoom: { type: Number, required: false, default: 0 },
        toilet: { type: Number, required: false, default: 0 }
      }
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

schema.pre("save", function(next) {
  bcrypt.hash(this.password, 10, (err, hash) => {
    this.password = hash;
    next();
  });
});

schema.pre("update", function(next) {
  bcrypt.hash(this.password, 10, (err, hash) => {
    this.password = hash;
    next();
  });
});

schema.post("save", function(error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("Executor already exist"));
  } else {
    next(error);
  }
});

schema.methods.comparePassword = function(candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, (err, success) => {
      if (err) {
        return reject(err);
      }
      return resolve(success);
    });
  });
};

schema.methods.AverageRate = function(rateArray) {
  return new Promise((resolve, reject) => {
    try {
      let averageRate =
        rateArray.reduce(function(p, c) {
          return p + c.rate;
        }, 0) / rateArray.length;

      return resolve(averageRate);
    } catch (err) {
      return reject(err);
    }
  });
};
schema.set("toObject", {
  transform: function(doc, ret) {
    delete ret.__v;
  }
});

schema.plugin(mongoosePaginate);
module.exports = mongoose.model("Executor", schema);
