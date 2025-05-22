const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
const paypal = require("paypal-rest-sdk");
const cors = require("cors");
const dbConfig = require("./config/db.config.js");
const schedule = require("node-schedule");
const cookieParser = require("cookie-parser");

//Routes
const userRoutes = require("./src/routes/userRoute");
const invoiceRoutes = require("./src/routes/invoiceRoute");
const clientRoutes = require("./src/routes/clientRoute");
const profileRoutes = require("./src/routes/profileRoute");
const firmRoutes = require("./src/routes/firmRoute");
const taxRoutes = require("./src/routes/taxRoutes");
const orgRoutes = require("./src/routes/orgRoute");
const productRoutes = require("./src/routes/productRoutes.js");
const leadRoutes = require("./src/routes/leadRoute");
const leadActivityRoutes = require("./src/routes/leadActivityRoute");
const activitRoutes = require("./src/routes/activityRoute.js");

const searchRoutes = require("./src/routes/searchRoute");
const roleRoutes = require("./src/routes/roleNpermissionRoute");
const attendenceRoutes = require("./src/routes/empAttendenceRoute");
const dedRoutes = require("./src/routes/dedRoute");
const salRoutes = require("./src/routes/salRoute");
const employeeRoutes = require("./src/routes/empRoute");
const vendorRoutes = require("./src/routes/vendorRoutes");
const purchesRoutes = require("./src/routes/purchesRoute.js");
const Subscription = require("./src/routes/subscriptionRoute.js");
const Reminder = require("./src/routes/reminderRoute.js");
const appRouter = require("./src/routes/HRM/mainRoutes.js");
const { default: axios } = require("axios");
const RecurringInvoiceModel = require("./src/models/RecurringInvoiceModel.js");
const InvoiceModel = require("./src/models/InvoiceModel.js");

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

const PORT = process.env.PORT || 5001;

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
app.use(cookieParser());

app.use("/api/auth", userRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/purchase", purchesRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/firm", firmRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/taxRates", taxRoutes);
app.use("/api/product", productRoutes);
app.use("/api/lead", leadRoutes);
app.use("/api/leadActivity", leadActivityRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/attendence", attendenceRoutes);
app.use("/api/ded", dedRoutes);
app.use("/api/sal", salRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/subscription", Subscription);
app.use("/api/Reminder", Reminder);
app.use("/api/hrm", appRouter);
app.use("/api/activities", activitRoutes);

const monthlySchedule = schedule.scheduleJob("0 0 * * *", async () => {
  try {
    const currentDate = new Date();

    // Query the database for recurring invoices that need to be processed
    // const recurringInvoices = await InvoiceModel.find({});
    const recurringInvoices = await InvoiceModel.find({
      "recurringInvoiceObj.start_date": { $exists: true },
      "recurringInvoiceObj.end_date": { $exists: true },
    });

    if (recurringInvoices.length !== 0) {
      for (const recurringInvoice of recurringInvoices) {
        // const end = recurringInvoice.recurringInvoiceObj.end_date &&
        const startDateSplit =
          recurringInvoice.recurringInvoiceObj.start_date.toISOString();
        const [startdatePart, starttimePart] = startDateSplit.split("T");
        const endDateSplit =
          recurringInvoice.recurringInvoiceObj.end_date.toISOString();
        const [enddatePart, endtimePart] = endDateSplit.split("T");

        const DueDateSplit = recurringInvoice.dueDate.toISOString();
        const [duedatePart, duetimePart] = DueDateSplit.split("T");
        if (enddatePart === currentDate.toISOString().split("T")[0]) {
          // console.log("InvoiceCount", recurringInvoice);
          const org = recurringInvoice.orgId.toString();

          const InvoiceCount = await axios.post(
            "https://crm-backend-xi.vercel.app/api/invoice/listInvoiceNumber",
            // "http://localhost:5001/api/invoice/listInvoiceNumber",
            {
              firmId: `${recurringInvoice.firm.firmID}`,
              orgId: org,
            }
          );
          const firmDetails = await axios.get(
            `https://crm-backend-xi.vercel.app/api/firm/getFirmforinvoicerecurring/${recurringInvoice.orgId}/${recurringInvoice.firm.firmID}`
            // `http://localhost:5001/api/firm/getFirmforinvoicerecurring/${recurringInvoice.orgId}/${recurringInvoice.firm.firmID}`
          );
          const invoiceNumber = InvoiceCount.data.data[0]
            ? InvoiceCount.data.data[0].split("-")[1]
            : 0;
          const UpdatedInvoiceCountDetails = Number(invoiceNumber) + 1;
          // console.log("invoiceNumber", invoiceNumber, InvoiceCount.data, recurringInvoice.firm.firmID, recurringInvoice.orgId);
          const updatedInvoiceObject = recurringInvoice;

          updatedInvoiceObject.invoiceNumber = `${
            firmDetails.data && firmDetails.data.data[0].invoicePrefix
          }-${UpdatedInvoiceCountDetails}`;
          console.log(
            InvoiceCount.data,
            "invoiceNumber",
            updatedInvoiceObject.invoiceNumber
          );

          const InvoiceItemArr = updatedInvoiceObject.items
            ? updatedInvoiceObject.items.length !== 0 &&
              updatedInvoiceObject.items.map((item, i) => {
                return {
                  itemName: item.itemName,
                  unitPrice: item.unitPrice,
                  quantity: item.unitPrice,
                  amount: item.amount,
                  hsn: item.hsn,
                  sac: item.sac,
                  taxRate: item.taxRate,
                  desc: item.desc,
                  discount: item.discount,
                };
              })
            : [];

          function adjustDates(startDate, endDate) {
            // Convert string dates to Date objects
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(endDate);

            // Find the gap between dates in milliseconds
            const dateGap = endDateObj - startDateObj;

            // Increase both dates by the gap
            const adjustedStartDate = new Date(
              startDateObj.getTime() + dateGap
            );
            const adjustedEndDate = new Date(endDateObj.getTime() + dateGap);

            // Format the dates
            const formattedStartDate = adjustedStartDate
              .toISOString()
              .split("T")[0];
            const formattedEndDate = adjustedEndDate
              .toISOString()
              .split("T")[0];

            return {
              start_date: formattedStartDate,
              end_date: formattedEndDate,
            };
          }

          const NewUpdatedArr = {
            client: updatedInvoiceObject.client,
            firm: updatedInvoiceObject.firm,
            recurringInvoiceObj: adjustDates(startdatePart, enddatePart),
            items: InvoiceItemArr,
            notes: updatedInvoiceObject.notes,
            remark: updatedInvoiceObject.remark,
            tax: updatedInvoiceObject.tax,
            taxAmt: updatedInvoiceObject.taxAmt,
            subTotal: updatedInvoiceObject.subTotal,
            total: updatedInvoiceObject.total,
            invoiceDate: updatedInvoiceObject.invoiceDate,
            dueDate: updatedInvoiceObject.dueDate,
            status: updatedInvoiceObject.status,
            amountPaid: updatedInvoiceObject.amountPaid,
            dueAmount: updatedInvoiceObject.dueAmount,
            delete: updatedInvoiceObject.delete,
            roundOff: updatedInvoiceObject.roundOff,
            invoiceNumber: updatedInvoiceObject.invoiceNumber,
            termsNcondition: updatedInvoiceObject.termsNcondition,
            currency: updatedInvoiceObject.currency,
            curConvert: updatedInvoiceObject.curConvert,
            incluTax: updatedInvoiceObject.incluTax,
            partialPay: updatedInvoiceObject.partialPay,
            allowTip: updatedInvoiceObject.allowTip,
            recurringInvoice: updatedInvoiceObject.recurringInvoice,
            draft: updatedInvoiceObject.draft,
            orgId: updatedInvoiceObject.orgId,
            payment: updatedInvoiceObject.payment,
          };

          const response = await axios.post(
            "https://crm-backend-xi.vercel.app/api/invoice/createrecurringinvoice",
            // "http://localhost:5001/api/invoice/createrecurringinvoice",

            NewUpdatedArr
          );

          console.log(
            "Invoices generated on the 1st day of the month.",
            response.data
          );
        }
        if (duedatePart === currentDate.toISOString().split("T")[0]) {
          function adjustDates(dueDate) {
            // Convert string dates to Date objects
            const startDateObj = new Date(dueDate);
            const currentDate = new Date();

            // Find the gap between dates in milliseconds
            const dateGap = currentDate - startDateObj;

            // Increase both dates by the gap
            const adjustedStartDate = new Date(
              startDateObj.getTime() + dateGap
            );

            // Format the dates
            const formattedStartDate = adjustedStartDate
              .toISOString()
              .split("T")[0];

            return {
              dueDate: formattedStartDate,
            };
          }

          //     // Example usage:
          const due = adjustDates(recurringInvoice.dueDate);
          const NewUpdatedArr = {
            dueDate: due.dueDate,
            status: "Pending",
          };

          const response = await axios.patch(
            `https://crm-backend-xi.vercel.app/api/invoice/updateInvoiceforrecurringinvoice/${recurringInvoice._id}`,
            // `http://localhost:5001/api/invoice/updateInvoiceforrecurringinvoice/${recurringInvoice._id}`,
            NewUpdatedArr
          );
          console.log("response", response);
        }
      }
    }
  } catch (error) {
    console.error("Error generating invoices:", error);
  }
});

// Handle errors if the schedule fails
monthlySchedule.on("error", (error) => {
  console.error("Schedule error:", error);
});
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
app.get("/api/cancel", (req, res) => res.send("Cancelled"))


process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at:", p, "reason:", reason);
  // application specific logging, throwing an error, or other logic here
})
process.on("uncaughtException", (err, origin) => {
  console.log("Uncaught Exception at:", origin, "error:", err);
  // application specific logging, throwing an error, or other logic here
})
app.listen(PORT, () => console.log(`Server Started on ${PORT}`));
