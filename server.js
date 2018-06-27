var express = require('express');
var braintree = require('braintree');
var app = express();

const port = process.env.PORT || 5000;

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

var router = express.Router();

app.listen(port, () => console.log(`Listening on port ${port}`));

router.get('/', function(req, res) {
    res.send('Node server is running on this port.');
});

router.post('/', function(req, res, next) {
  var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: '5qgyxghdfd2pzwqx',
    publicKey: 'vgv45bddf3xvfdtr',
    privateKey: 'dea35d036fad307c36e7a1066fc10f2e'
  });
  var newTransaction = gateway.transaction.sale({
    amount: '12.34',
    paymentMethodNonce: req.body.paymentMethodNonce,
    options: {
      submitForSettlement: true
    }
  }, function(error, result) {
      if (result) {
        res.send(result);
      } else {
        res.status(500).send(error);
      }
  });
});

app.use('/', router);
