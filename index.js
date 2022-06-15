const express = require("express");
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AZztDLA-o89y9J1tu9xqXz922eSRC7i6P_Wd09HIQF_rjssNQjEFs7s8c31xJ0v01GtAP53KeLb6po7Z",
  client_secret:
    "EJ_tyhMFXp0qKjbqZSsZBix490-WU0lVSdh9NH1vDHG3_3eQbX2bsO73MkasdjmTjkKav47S7a0itv0Y",
});

const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

app.post("/pay", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Red Sox Hat",

              price: "5.00",
              currency: "USD",
              quantity: 1,
            },
            {
              name: "Milk",

              price: "5.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "10.00",
        },
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
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

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
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

app.get("/cancel", (req, res) => res.send("Cancelled"));

app.listen(PORT, () => console.log(`Server Started on ${PORT}`));
