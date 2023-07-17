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
    const user = await User.findOne({ email: req.body.email });
    let stripeCustomerId = user?.stripeCustomerID;
    console.log({ stripeCustomerId });
    if (!stripeCustomerId || stripeCustomerId) {
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
          $set: {
            stripeCustomerId: customer.id,
          },
        };
        const savedUser = await User.updateOne(
          { email: req.body.email },
          updateDoc,
          {
            upsert: true,
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
          success_url: "https://app.connectvid.io/payment_success",
          cancel_url: "https://app.connectvid.io/payment_fail",
          customer: stripeCustomerId,
        },
        {
          apiKey: process.env.STRIPE_SECRET_KEY,
        }
      );
    } catch (er) {
      console.log(er);
    }
    console.log({ session });
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

//
exports.webhook = async (request, response, next) => {
  try {
    console.log("object");
    const sig = request.headers["stripe-signature"];
    // const endpointSecret = "whsec_O3BsUNzg9LVSeSBZL2KtPqA3Ub4yLNJE"; //live secret for render server
    const endpointSecret = "whsec_TF4RIwDdMclsSCl5f2Yuqw8CjO4U3dc5"; //local secret for local server

    let event;

    try {
      console.log({
        stripeWebhooksConstructEvent: stripe.webhooks.constructEvent,
      });
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      console.log("try executed");
    } catch (err) {
      console.log("try error");
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    switch (event.type) {
      case "charge.succeeded":
        const chargeSucceeded = event.data.object;
        const status = chargeSucceeded?.status;
        const paid = chargeSucceeded?.paid;
        const amount_captured = chargeSucceeded?.amount_captured;
        const email = chargeSucceeded?.billing_details?.email;
        console.log({
          email,
          status,
          paid,
          amount_captured,
        });
        if (email && paid && amount_captured && status === "succeeded") {
          //update your database
          if (amount_captured === 5000) {
            //add basic subscription
            try {
              const query = { email: email };
              const options = { upsert: true };
              const endDate = new Date();
              endDate.setMonth(endDate.getMonth() + 1);

              const updateDoc = {
                $set: {
                  selectedPlan: "basic",
                  endDate: endDate,
                  credit: 100,
                },
              };
              const userUpdate = await User.updateOne(
                query,
                updateDoc,
                options
              );
            } catch (e) {
              console.log(e);
            }
          } else if (amount_captured === 20000) {
            //add standard subscription
            try {
              const query = { email: email };
              const options = { upsert: true };
              const endDate = new Date();
              endDate.setMonth(endDate.getMonth() + 1);

              const updateDoc = {
                $set: {
                  selectedPlan: "standard",
                  endDate: endDate,
                  credit: 500,
                },
              };
              const userUpdate = await User.updateOne(
                query,
                updateDoc,
                options
              );
            } catch (e) {
              console.log(e);
            }
          } else if (amount_captured === 60000) {
            //add pro subscription
            try {
              const query = { email: email };
              const options = { upsert: true };
              const endDate = new Date();
              endDate.setMonth(endDate.getMonth() + 1);

              const updateDoc = {
                $set: {
                  selectedPlan: "premium",
                  endDate: endDate,
                  credit: 2000,
                },
              };
              const userUpdate = await User.updateOne(
                query,
                updateDoc,
                options
              );
            } catch (e) {
              console.log(e);
            }
          } else {
            console.log("request to another server");
          }
        } else {
          response.status(422).send({
            isSuccess: false,
            message:
              "billing details or some important payment infos are missing!",
          });
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  } catch (e) {
    response.status(500).send({ message: e.message || "something went wrong" });
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
