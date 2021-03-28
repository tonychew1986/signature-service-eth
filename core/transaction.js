
const bip39 = require('bip39');

require('dotenv').config()

const config = require('config');

const nodeMainnet = process.env.NODE_URI_MAINNET || config.get('node-uri-mainnet'); // "https://mainnet.infura.io/v3/ba29ca3746574629bccb2063975f1cf7"
const nodeTestnet = process.env.NODE_URI_TESTNET || config.get('node-uri-testnet'); // "https://ropsten.infura.io/v3/c49355f661ea403ca9aeb237dce70e94"

const chainId = process.env.CHAIN_ID || config.get('chain-id'); // "ropsten"

const fs = require("fs")

const lightwallet = require('eth-lightwallet');
var txutils = lightwallet.txutils;
var signing = lightwallet.signing;
var encryption = lightwallet.encryption;

const EthereumTx = require('ethereumjs-tx').Transaction

const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(nodeTestnet));



var mnemonicMainnet = process.env.MNEMONIC_MAINNET
var mnemonicTestnet = process.env.MNEMONIC_TESTNET

var keySequence = 9999;

// const seed = process.env.ETH_MNEMONIC
const seedPassword = process.env.SEED_PASSWORD || "123456789";

let generateSeed = async function(){
	const mnemonic = bip39.generateMnemonic();

	return mnemonic
}

let getAddress = async function(network, nonce) {
  var seed;
  var web3;
  if(network == "mainnet"){
    seed = mnemonicMainnet
    web3 = new Web3(new Web3.providers.HttpProvider(nodeMainnet));
  }else if(network == "testnet"){
    seed = mnemonicTestnet
    web3 = new Web3(new Web3.providers.HttpProvider(nodeTestnet));
  }

  let addr = await new Promise(function(resolve, reject) {
    lightwallet.keystore.createVault({
      password: seedPassword,
      seedPhrase: seed,
      hdPathString: "m/44'/60'/0'/0"
    }, function (err, ks) {
        ks.keyFromPassword(seedPassword, function (err, pwDerivedKey) {
            if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
                throw new Error("Incorrect derived key!");
            }

            try {
                ks.generateNewAddress(pwDerivedKey, parseInt(nonce) + 1);
            } catch (err) {
                console.log(err);
                console.trace();
            }

            var addressSpecific = ks.getAddresses()[nonce]
            // var prv_key = ks.exportPrivateKey(addressSpecific, pwDerivedKey);
            //
            // console.log("prv_key", prv_key)

            resolve(addressSpecific)
            // return addressSpecific
        });
    })
  }).then(function(addressSpecific) { // (**)

    console.log("addressSpecific",addressSpecific); // 1
    return addressSpecific
  });

  return addr
}

let getAddressFull = async function(network, nonce) {
  var seed;
  var web3;
  if(network == "mainnet"){
    seed = mnemonicMainnet
    web3 = new Web3(new Web3.providers.HttpProvider(nodeMainnet));
  }else if(network == "testnet"){
    seed = mnemonicTestnet
    web3 = new Web3(new Web3.providers.HttpProvider(nodeTestnet));
  }

  let addr = await new Promise(function(resolve, reject) {
    lightwallet.keystore.createVault({
      password: seedPassword,
      seedPhrase: seed,
      hdPathString: "m/44'/60'/0'/0"
    }, function (err, ks) {
        ks.keyFromPassword(seedPassword, function (err, pwDerivedKey) {
            if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
                throw new Error("Incorrect derived key!");
            }

            try {
                ks.generateNewAddress(pwDerivedKey, parseInt(nonce) + 1);
            } catch (err) {
                console.log(err);
                console.trace();
            }

            var addresses = ks.getAddresses()
            // var prv_key = ks.exportPrivateKey(addressSpecific, pwDerivedKey);
            //
            // console.log("prv_key", prv_key)

            resolve(addresses)
            // return addressSpecific
        });
    })
  }).then(function(addresses) { // (**)

    console.log("addresses",addresses); // 1
    return addresses
  });

  return addr
}

let txSendToken = async function(network, nonce, senderAdd, receiverAdd, amount, tokenType, gas, gasLimit) {
  let abiArray;
  let contractAddress;
  let tokenDenominationBase;

  var seed;
  var web3;
  var gas_limit;

  tokenType = tokenType.toUpperCase();

  if(network == "mainnet"){
    seed = mnemonicMainnet
    web3 = new Web3(new Web3.providers.HttpProvider(nodeMainnet));

	  // if(tokenType == "LINK"){
	  //   abiArray = JSON.parse(fs.readFileSync('./abi/abi_ropsten_LINK.json', 'utf-8'));
	  //   contractAddress = "0x20fE562d797A42Dcb3399062AE9546cd06f63280";
	  //   tokenDenominationBase = 18;
	  // }else if(tokenType == "USDT"){
	  //   abiArray = JSON.parse(fs.readFileSync('./abi/abi_ropsten_USDT.json', 'utf-8'));
	  //   contractAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7";
	  //   tokenDenominationBase = 6;
	  // }
  }else if(network == "testnet"){
    seed = mnemonicTestnet
    web3 = new Web3(new Web3.providers.HttpProvider(nodeTestnet));

	  // if(tokenType == "LINK"){
	  //   abiArray = JSON.parse(fs.readFileSync('./abi/abi_ropsten_LINK.json', 'utf-8'));
	  //   contractAddress = "0x20fE562d797A42Dcb3399062AE9546cd06f63280";
	  //   tokenDenominationBase = 18;
	  // }else if(tokenType == "USDT"){
	  //   abiArray = JSON.parse(fs.readFileSync('./abi/abi_ropsten_USDT.json', 'utf-8'));
	  //   contractAddress = "0xe11210AE133edD21fc2C7C974EBc20ABBe836243";
	  //   tokenDenominationBase = 6;
	  // }
  }

	abiArray = config.get(tokenType + '.address.' + network);
	contractAddress = config.get(tokenType + '.abi');
	tokenDenominationBase = config.get(tokenType + '.decimal');

  let contract = new web3.eth.Contract(abiArray, contractAddress, {
    from: senderAdd
  });

  let tx = await new Promise(function(resolve, reject) {

    let hdPath = "m/44'/60'/0'/0"

    lightwallet.keystore.createVault({
      password: seedPassword,
      seedPhrase: seed,
      hdPathString: hdPath
    }, function (err, ks) {
      ks.keyFromPassword(seedPassword, function (err, pwDerivedKey) {
        if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
            throw new Error("Incorrect derived key!");
        }

        // var addressAll = ks.getAddresses();
        // var addressSpecific = ks.getAddresses()[nonce]
        // // var prv_key = ks.exportPrivateKey(addressSpecific, pwDerivedKey);

        ks.generateNewAddress(pwDerivedKey, keySequence);
        // var sendingAddr = ks.getAddresses()[1];
        // console.log("sendingAddr", sendingAddr)
        // console.log("senderAdd", senderAdd)


        let prv_key = ks.exportPrivateKey(senderAdd, pwDerivedKey);
        console.log("prv_key", prv_key)

        let privateKey = Buffer.from(prv_key,'hex')
        console.log("privateKey", privateKey)

        gas = Number(gas).toPrecision();

        if (gasLimit == "") {
          gas_limit = web3.utils.toHex(100000);
        } else {
          gas_limit = web3.utils.toHex(Number(gasLimit).toPrecision())
        }
        
        //let gas_limit = web3.utils.toHex(100000)
        let gas_price = web3.utils.toHex(web3.utils.toWei(gas, 'gwei'))
        // let gas_price = web3.utils.toHex(web3.utils.toWei('20', 'gwei'))
        // let value = web3.utils.toHex(web3.utils.toWei(amount,'ether'))
        let tokenDenomination = Math.pow(10, tokenDenominationBase);
        let tokenValue = (amount * tokenDenomination).toString()

        let transaction = {
            gasPrice: gas_price,
            gasLimit: gas_limit,
            to: contractAddress, //receiverAdd,
            from: senderAdd,
            value: '0x0',
            // data: contract.transfer.getData(receiverAdd, tokenValue, {from: senderAdd}),
            data: contract.methods.transfer(receiverAdd, tokenValue).encodeABI(),
            nonce: nonce
        }

        var tx;
        if(network == "mainnet"){
           tx = new EthereumTx(transaction, { chain: 'mainnet' });
        }else if(network == "testnet"){
           tx = new EthereumTx(transaction, { chain: chainId });
        }

        console.log("tx", tx)
        tx.sign(privateKey);
        console.log("tx", tx)

        var serializedTx = tx.serialize();
        console.log("serializedTx", serializedTx)

        console.log(serializedTx.toString('hex'));

        var serializedTxToHex = "0x" + serializedTx.toString('hex')

        resolve(serializedTxToHex);
      })
    })
  }).then(function(serializedTxToHex) { // (**)

    console.log("serializedTxToHex", serializedTxToHex); // 1
    return serializedTxToHex;
  });

  return tx
}

let txSend = async function(network, nonce, senderAdd, receiverAdd, amount, gas, gasLimit) {
  var seed;
  var web3;
  var gas_limit;
  if(network == "mainnet"){
    seed = mnemonicMainnet
    web3 = new Web3(new Web3.providers.HttpProvider(nodeMainnet));
  }else if(network == "testnet"){
    seed = mnemonicTestnet
    web3 = new Web3(new Web3.providers.HttpProvider(nodeTestnet));
  }

  let tx = await new Promise(function(resolve, reject) {

    let hdPath = "m/44'/60'/0'/0"

    lightwallet.keystore.createVault({
      password: seedPassword,
      seedPhrase: seed,
      hdPathString: hdPath
    }, function (err, ks) {
      ks.keyFromPassword(seedPassword, function (err, pwDerivedKey) {
        if (!ks.isDerivedKeyCorrect(pwDerivedKey)) {
            throw new Error("Incorrect derived key!");
        }

        // var addressAll = ks.getAddresses();
        // var addressSpecific = ks.getAddresses()[nonce]
        // // var prv_key = ks.exportPrivateKey(addressSpecific, pwDerivedKey);

        ks.generateNewAddress(pwDerivedKey, keySequence);
        // var sendingAddr = ks.getAddresses()[1];
        // console.log("sendingAddr", sendingAddr)
        // console.log("senderAdd", senderAdd)


        let prv_key = ks.exportPrivateKey(senderAdd, pwDerivedKey);
        console.log("prv_key", prv_key)

        let privateKey = Buffer.from(prv_key,'hex')
        console.log("privateKey", privateKey)

        gas = Number(gas).toPrecision();
				amount = Number(amount).toPrecision();

        if (gasLimit == "") {
          gas_limit = web3.utils.toHex(100000);
        } else {
          gas_limit = web3.utils.toHex(Number(gasLimit).toPrecision());
        }

        //let gas_limit = web3.utils.toHex(100000)
        let gas_price = web3.utils.toHex(web3.utils.toWei(gas, 'gwei'))
        //let gas_price = web3.utils.toHex(web3.utils.toWei('20', 'gwei'))
        let value = web3.utils.toHex(web3.utils.toWei(amount,'ether'))
        //let nonce = web3.utils.toHex(nonce)

        let transaction = {
            gasPrice: gas_price,
            gasLimit: gas_limit,
            to: receiverAdd,
            value: value,
            nonce: nonce
        }

        var tx;
        if(network == "mainnet"){
           tx = new EthereumTx(transaction, { chain: 'mainnet' });
        }else if(network == "testnet"){
           tx = new EthereumTx(transaction, { chain: chainId });
        }

        console.log("tx", tx)
        tx.sign(privateKey);
        console.log("tx", tx)

        var serializedTx = tx.serialize();
        console.log("serializedTx", serializedTx)

        console.log(serializedTx.toString('hex'));

        var serializedTxToHex = "0x" + serializedTx.toString('hex')

        resolve(serializedTxToHex);
      })
    })
  }).then(function(serializedTxToHex) { // (**)

    console.log("serializedTxToHex", serializedTxToHex); // 1
    return serializedTxToHex;
  });

  return tx
}


exports.generateSeed = generateSeed;
exports.getAddress = getAddress;
exports.getAddressFull = getAddressFull;
exports.txSendToken = txSendToken;
exports.txSend = txSend;
