const User = require("../models/User");
const { stripe } = require("../utils/stripe");

//get products/prices
exports.getPrices = async (req, res, next) => {
  const prices = await stripe.prices.list({
    apiKey: process.env.STRIPE_SECRET_KEY,
  });
  res.send({ prices });
};

//createSession
exports.createSession = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).exec();
    let stripeCustomerId = user?.stripeCustomerID;
    if (!stripeCustomerId) {
      try {
        const customer = await stripe.customers.create(
          {
            email: req.body.email,
          },
          {
            apiKey: process.env.STRIPE_SECRET_KEY,
          }
        );

        stripeCustomerId = customer.id;
        const updateDoc = {
          // $set: {
          //   stripeCustomerID: customer.id,
          // },
          stripeCustomerID: customer.id,
        };

        const updateResult = await User.findOneAndUpdate(
          { email: req.body.email },
          updateDoc,
          {
            upsert: true,
            new: true,
          }
        );
      } catch (err) {
        console.log(err);
      }
    }

    console.log({ stripeCustomerId });

    let session;
    try {
      console.log("trying");
      session = await stripe.checkout.sessions.create(
        {
          mode: "subscription",
          payment_method_types: ["card"],
          currency: "usd",
          line_items: [
            {
              price: req.body.priceId,
              quantity: 1,
            },
          ],
          success_url: "https://app.hootspy.com/",
          cancel_url: "https://app.hootspy.com/",
          customer: stripeCustomerId,
        },
        {
          apiKey: process.env.STRIPE_SECRET_KEY,
        }
      );
    } catch (er) {
      console.log(er);
    }
    // console.log({ session });
    return res.status(200).send({
      isSuccess: true,
      session: session,
    });
  } catch (e) {
    res.status(500).send({ message: "something went wrong" });
  }
};

exports.checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user.stripeCustomerID) {
      const subscriptions = await stripe.subscriptions.list(
        {
          customer: user.stripeCustomerID,
          status: "all",
          expand: ["data.default_payment_method"],
        },
        {
          apiKey: process.env.STRIPE_SECRET_KEY,
        }
      );

      if (subscriptions?.data?.length == 0) {
        return res.send({
          data: {
            havePlan: false,
          },
        });
      }

      res.send({
        data: {
          havePlan: true,
          created: subscriptions?.data[0].created * 1000,
          current_period_start:
            subscriptions?.data[0].current_period_start * 1000,
          current_period_end: subscriptions?.data[0].current_period_end * 1000,
          email: subscriptions?.data[0].email,
          name: subscriptions?.data[0].name,
          plan: subscriptions?.data[0].plan,
          // subscriptions: subscriptions.data[0],
        },
      });
    } else {
      return res.send({
        data: {
          havePlan: false,
        },
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
      isSuccess: false,
    });
  }
};

//cancelSubscription
exports.cancelSubscription = async (req, res, next) => {
  try {
    const customerID = req.body.customerID;
    // https://stackoverflow.com/questions/63886638/stripe-cancel-a-subscription-in-js
    /*
        // Set your secret key. Remember to switch to your live secret key in production.
        // See your keys here: https://dashboard.stripe.com/apikeys
        const stripe = require('stripe')('sk_test_51M0QGtCx996FZZgar0EDav42cUAomy2QXE4UIeae8WglFKFD7VtyfUx2Jkgkaw9hEMyJ9pPLZ2eqJbngBHZdkozK00YBZqs9VM');

        stripe.subscriptions.update('sub_49ty4767H20z6a', {cancel_at_period_end: true});
    */
  } catch (err) {
    res.status.send({ isSuccess: false });
  }
};

exports.webhook = async (request, response, next) => {
  try {
    const sig = request.headers["stripe-signature"];
    const endpointSecret = "whsec_IumNflupfBPr6XfeIeN9HrJqBs3Dp1Wu"; // Your endpoint secret

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    console.log(event.type, 1234);

    switch (event.type) {
      // case "customer.subscription.created": // customer.subscription.updated event triggers when user creates a new subscription
      case "customer.subscription.updated":
        const subscription = event.data.object;

        const endDate = new Date(subscription.current_period_end * 1000);
        const customerId = subscription.customer;
        let selectedPlan = "",
          credit = 0;

        if (subscription.plan.product === "prod_Ob7YXNhbw1zVUz") {
          selectedPlan = "basic";
          credit = 29000;
        } else if (subscription.plan.product === "prod_Ob7dW5mx8llKLf") {
          selectedPlan = "standard";
          credit = 59000;
        } else if (subscription.plan.product === "prod_Ob7eqM9mMfr0qU") {
          selectedPlan = "premium";
          credit = 99000;
        } else if (subscription.plan.product === "prod_OCrzCUPt4SGKZk") {
          selectedPlan = "test";
          credit = 1234;
        }

        // Retrieve the customer's email using the Stripe API
        const customer = await stripe.customers.retrieve(customerId);
        const email = customer.email;
        // console.log(email, " this is the customer email");
        // console.log(selectedPlan, " this is the customer selectedPlan");
        // console.log(endDate, " this is the customer endDate");
        // console.log(credit, " this is the customer credit");
        if (selectedPlan && credit) {
          const updateDoc = {
            $set: {
              selectedPlan: selectedPlan,
              endDate: endDate,
              credit: credit,
            },
          };

          try {
            const query = { email: email };
            const options = { upsert: true };
            console.log(query, updateDoc, options);

            const userUpdate = await User.updateOne(query, updateDoc, options);
            console.log(userUpdate, "userUpdate log");
          } catch (e) {
            console.log(e);
          }
        }

        break;
      case "customer.subscription.deleted":
        const canceledSubscription = event.data.object;
        const canceledUserId = canceledSubscription.customer;
        const customerObj = await stripe.customers.retrieve(canceledUserId);
        const canceledEmail = customerObj.email;

        // Update user data to reflect cancellation (you can set relevant fields to null or perform any other necessary action)
        const cancelUpdateDoc = {
          $set: {
            selectedPlan: "none",
            // endDate: null,
            credit: 0,
          },
        };

        try {
          const cancelQuery = { email: canceledEmail };
          const cancelOptions = { upsert: true };

          const canceledUserUpdate = await User.updateOne(
            cancelQuery,
            cancelUpdateDoc,
            cancelOptions
          );
        } catch (e) {
          console.log(e);
        }

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  } catch (e) {
    response.status(500).send({ message: e.message || "Something went wrong" });
  }
};

// old webhook
// exports.webhook = async (request, response, next) => {
//   try {
//     console.log("object");
//     const sig = request.headers["stripe-signature"];
//     const endpointSecret = "whsec_1D5pHqttXnLHZDn2Ni8NPFfOG0fWxfhV"; //live secret for render server

//     let event;

//     try {
//       console.log({
//         stripeWebhooksConstructEvent: stripe.webhooks.constructEvent,
//       });
//       event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//       console.log("try executed");
//     } catch (err) {
//       console.log("try error");
//       response.status(400).send(`Webhook Error: ${err.message}`);
//       return;
//     }

//     switch (event.type) {
//       case "charge.succeeded":
//         const chargeSucceeded = event.data.object;
//         const status = chargeSucceeded?.status;
//         const paid = chargeSucceeded?.paid;
//         const amount_captured = chargeSucceeded?.amount_captured;
//         const email = chargeSucceeded?.billing_details?.email;
//         console.log({
//           email,
//           status,
//           paid,
//           amount_captured,
//         });
//         if (email && paid && amount_captured && status === "succeeded") {
//           //update your database
//           if (amount_captured === 2900) {
//             //add basic subscription
//             try {
//               const query = { email: email };
//               const options = { upsert: true };
//               const endDate = new Date();
//               endDate.setFullYear(endDate.getFullYear() + 1); // Increase endDate by 1 year

//               const updateDoc = {
//                 $set: {
//                   selectedPlan: "basic",
//                   endDate: endDate,
//                   credit: 29999,
//                 },
//               };
//               const userUpdate = await User.updateOne(
//                 query,
//                 updateDoc,
//                 options
//               );
//             } catch (e) {
//               console.log(e);
//             }
//           } else if (amount_captured === 5900) {
//             //add standard subscription
//             try {
//               const query = { email: email };
//               const options = { upsert: true };
//               const endDate = new Date();
//               endDate.setFullYear(endDate.getFullYear() + 1); // Increase endDate by 1 year

//               const updateDoc = {
//                 $set: {
//                   selectedPlan: "standard",
//                   endDate: endDate,
//                   credit: 59000,
//                 },
//               };
//               const userUpdate = await User.updateOne(
//                 query,
//                 updateDoc,
//                 options
//               );
//             } catch (e) {
//               console.log(e);
//             }
//           } else if (amount_captured === 9900) {
//             //add pro subscription
//             try {
//               const query = { email: email };
//               const options = { upsert: true };
//               const endDate = new Date();
//               endDate.setFullYear(endDate.getFullYear() + 1); // Increase endDate by 1 year

//               const updateDoc = {
//                 $set: {
//                   selectedPlan: "premium",
//                   endDate: endDate,
//                   credit: 99999,
//                 },
//               };
//               const userUpdate = await User.updateOne(
//                 query,
//                 updateDoc,
//                 options
//               );
//             } catch (e) {
//               console.log(e);
//             }
//           } else {
//             console.log("request to another server");
//           }
//         } else {
//           response.status(422).send({
//             isSuccess: false,
//             message:
//               "billing details or some important payment infos are missing!",
//           });
//         }
//         break;
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     response.send();
//   } catch (e) {
//     response.status(500).send({ message: e.message || "something went wrong" });
//   }
// };
