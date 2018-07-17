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
  merchantId: constants.MERCHANT_KEY,
  publicKey: constants.PUBLIC_KEY,
  privateKey: constants.PRIVATE_KEY,
});

app.listen(port, () => console.log(`Listening on port ${port}`));

router.get('/', function(req, res) {
  res.send('Node server is running on this port.');
});

router.get('/client_token', function(req, res, next) {
  gateway.clientToken.generate({}, function (err, result) {
    if (result) {
      res.send(result);
    } else {
      res.status(500).send('Failed to retrieve client token, error: ' + error);
    }
  });
});

router.post('/check_out', function(req, res, next) {
/*
This is not production ready. Purposely written minimally for the codechallenge.
I created a customer via the Control Panel with customerId '12345' and this
request _always_ adds a new PaymentMethod before making a transaction.
Would ideally be smarter and attempt to find/update a customer or create a new
customer and move into card verification from there.
*/
  gateway.paymentMethod.create({
    customerId: constants.CUSTOMER_ID,
    paymentMethodNonce: req.body.paymentMethodNonce,
    options: {
      verifyCard: true,
    }
  }, function(error, result) {
    if (result) {
      gateway.transaction.sale({
        amount: constants.TRANSACTION_AMOUNT,
        paymentMethodToken: result.paymentMethod.token,
        options: {
          submitForSettlement: true,
        }
      }, function(error, result) {
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
