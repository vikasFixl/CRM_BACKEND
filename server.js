const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
const paypal = require("paypal-rest-sdk");
const cors = require("cors");
const dbConfig = require("./config/db.config.js");

//Routes
const userRoutes = require("./src/routes/userRoute");
const invoiceRoutes = require("./src/routes/invoiceRoute");
const clientRoutes = require("./src/routes/clientRoute");
const profileRoutes = require("./src/routes/profileRoute");
const searchRoutes = require("./src/routes/searchRoute");
const firmRoutes = require("./src/routes/firmRoute");
const leadRoutes = require("./src/routes/leadRoute");
const orgRoutes = require("./src/routes/orgRoute");
const roleRoutes=require("./src/routes/roleNpermissionRoute");

require("dotenv").config({
  path: path.join(__dirname, "./.env"),
});

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AaWQSsw8-Pf15jr3lZZ2gcGjn3XZHk9_OdJgDI5AKODcy18_Gw-3pOVHOxVTNwfWLj5jFOLzmeHiDSf7",
  client_secret:
    "EFl7mXSY6pm8Z-cWHdJaEGKkZspJl7kOLDmixxyvaylsSrrunpdC8u9YZWO0bHKBWfLwOdNhtld-0L0w",
});

const app = express();

const PORT = process.env.PORT || 5000;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  autoIndex: false, // Don't build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.url, options, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database.", err);
    process.exit();
  });

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(express.json());
// app.use("/", async (req, res) => {
//   try {
//     res.status(200).json({ message: "Hello World!" });
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// });
app.use("/api/auth", userRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/firm", firmRoutes);
app.use("/api/lead", leadRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/role",roleRoutes);

app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) {
    const accessToken = req.headers["x-access-token"];
    const { userId, exp } = await jwt.verify(
      accessToken,
      process.env.JWT_SECRET
    );
    // Check if token has expired
    if (exp < Date.now().valueOf() / 1000) {
      return res.status(401).json({
        error: "JWT token has expired, please login to obtain a new one",
      });
    }
    res.locals.loggedInUser = await User.findById(userId);
    next();
  } else {
    next();
  }
});

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

app.post("/api/pay", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "https://paypallinknodejs.herokuapp.com/success",
      cancel_url: "https://paypallinknodejs.herokuapp.com/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Red Sox Hat",
              sku: "001",
              price: "5.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "5.00",
        },
        description: "Hat for the best team ever",
      },
    ],
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/api/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "5.00",
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        res.send("Success");
      }
    }
  );
});

app.get("/api/cancel", (req, res) => res.send("Cancelled"));

app.listen(PORT, () => console.log(`Server Started on ${PORT}`));
