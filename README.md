Signature Service for Ethereum (ETH)
=====================================

<URL>

How does this work?
----------------

Signature service is used in conjunction with Wallet service to enable secure signing and transaction related functionality for blockchain. Since different blockchain have nuance differences, this services are application specific.

This service should not be called directly (besides during testing) and should only be called through Wallet Aggregator in production. This is to  prevent errors from sending coins on main net. Safeguards are applied on Wallet Aggregator that always defaults any calls to testnet.

** Signature Service must be placed in environment where all ports are closed and only source of communication is with Wallet Service

Application Flow
-------

Client UI <-> Wallet Aggregator <-> Wallet Service <-> Signature Service

Adding Support of ERC20 Tokens
-------

- Go to Etherscan
- Search for the desired contract (e.g. Kyber Network)
- Results will show the token address (e.g. https://etherscan.io/token/0xdd974d5c2e2928dea5f71b9825b8b646686bd200)
- However we'll need to navigate to the contract address (e.g. https://etherscan.io/address/0xdd974d5c2e2928dea5f71b9825b8b646686bd200)
- Under the contract page, you should see a contract tab below
- After clicking it, scroll down and you'll see "Contract ABI"
- Copy it and create a new json file with corresponding name in the abi folder
- Link it accordingly within the code

Blockchain Differences
-------

- Sending ERC 20 tokens
- Requires smart contract ABI & noting down decimal point of token

Available End points
-------
- GET /test
- GET /wallet?network=<network>&nonce=<nonce>
- POST /send?network=<network>&amount=<amount>&senderAdd=<senderAdd>&receiverAdd=<receiverAdd>&nonce=<nonce>
- POST /send/token?network=<network>&amount=<amount>&senderAdd=<senderAdd>&receiverAdd=<receiverAdd>&tokenType=<tokenType>&nonce=<nonce>

ENV parameters
-------
Available at ./instructions/env.md

## Instructions

To test application:

```bash
$ npm test
```

Install NPM modules on fresh deployment:

```bash
$ npm install
```

To run in development mode:

```bash
$ node index.js
```

To run in production mode:

```bash
$ pm2 start sign-svc-eth/index.js --name "sign-eth"
```
