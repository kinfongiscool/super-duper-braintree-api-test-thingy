require('dotenv').load();
var constants = require('./src/constants.js');
var express = require('express');
var braintree = require('braintree');
var app = express();

const port = process.env.PORT || 5000;

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

var router = express.Router();

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.REACT_APP_MERCHANT_KEY,
  publicKey: process.env.REACT_APP_PUBLIC_KEY,
  privateKey: process.env.REACT_APP_PRIVATE_KEY,
});

app.listen(port, () => console.log(`Listening on port ${port}`));

router.get('/', (req, res) => {
  res.send('Node server is running on this port.');
});

router.get('/client_token', (req, res, next) => {
  gateway.clientToken.generate({}, (err, result) => {
    if (result) {
      res.send(result);
    } else {
      res.status(500).send('Failed to retrieve client token, error: ' + error);
    }
  });
});

router.post('/check_out', (req, res, next) => {
/*
This is not production ready. Purposely written minimally for the code exercise.
A customer with customerId '12345' exists in my vault. This request _always_
adds a new PaymentMethod before making a transaction. Would ideally be smarter
by attempting first to find/update a customer. If no customer found, create a
new customer then verify the card from there.
*/
  gateway.paymentMethod.create({
    customerId: constants.CUSTOMER_ID,
    paymentMethodNonce: req.body.paymentMethodNonce,
    options: {
      verifyCard: true,
    }
  }, (error, result) => {
    if (result) {
      gateway.transaction.sale({
        amount: constants.TRANSACTION_AMOUNT,
        paymentMethodToken: result.paymentMethod.token,
        options: {
          submitForSettlement: true,
        }
      }, (error, result) => {
        if (result) {
          res.send(result);
        } else {
          res.status(500).send('Transaction failed, error: ' + error);
        }
      });
    } else {
      res.status(500).send('Verification failed, error: ' + error);
    }
  });

});

app.use('/', router);
