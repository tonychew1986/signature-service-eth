var express = require('express')
var router = express.Router()

var txETH = require('../core/transaction.js');


const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next)

router.get('/test', (req, res) => {
  return res.send('test');
});

router.get('/generate/seed', asyncHandler(async (req, res, next) => {
  let seed = await txETH.generateSeed();

  return res.send(seed);
}));

router.post('/wallet', asyncHandler(async (req, res, next) => {
  var network = req.body.network
  var nonce = req.body.nonce
  let data = await txETH.getAddress(network, nonce)

  console.log("data", data)

  return res.send(data);
}));

router.post('/wallet/all', asyncHandler(async (req, res, next) => {
  var network = req.body.network
  var nonce = req.body.nonce
  let data = await txETH.getAddressFull(network, nonce)

  console.log("data", data)

  return res.send(data);
}));

//
// SEND ETH
//
router.post('/send', asyncHandler(async (req, res, next) => {
  var network = req.body.network
  var amount = req.body.amount
  var senderAdd = req.body.senderAdd
  var receiverAdd = req.body.receiverAdd
  var nonce = req.body.nonce;
  var gas = req.body.gas;
  var gasLimit = req.body.gasLimit;

  let tx = await txETH.txSend(network, nonce, senderAdd, receiverAdd, amount, gas, gasLimit);

  console.log("tx", tx)

  return res.send(tx);
}));

//
// SEND ETH ERC-20 TOKEN
//
router.post('/send/token', asyncHandler(async (req, res, next) => {
  var network = req.body.network
  var amount = req.body.amount;
  var tokenType = req.body.tokenType;
  var senderAdd = req.body.senderAdd;
  var receiverAdd = req.body.receiverAdd;
  var nonce = req.body.nonce;
  var gas = req.body.gas;
  var gasLimit = req.body.gasLimit;

  let tx = await txETH.txSendToken(network, nonce, senderAdd, receiverAdd, amount, tokenType, gas, gasLimit);

  console.log("tx", tx)

  return res.send(tx);
}));

// router.post('/sign', (req, res) => {
//   var msg = req.body.message
//   tx = txSigning(msg);
//
//   console.log("tx", tx)
//
//   axios.post(walletAPI + '/broadcast', {
//     signedTx: tx
//   })
//   .then(function (response) {
//     // console.log(response);
//   })
//   .catch(function (error) {
//     // console.log(error);
//   });
//
//   return res.send('Sign');
// });




module.exports = router
