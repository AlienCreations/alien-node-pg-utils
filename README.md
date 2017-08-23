# alien-node-pg-utils
Helper functions for Postgresql on NodeJS. The functions are pure and curried with Ramda.

[![Build Status](https://travis-ci.org/AlienCreations/alien-node-pg-utils.svg?branch=master)](https://travis-ci.org/AlienCreations/alien-node-pg-utils) [![Coverage Status](https://coveralls.io/repos/AlienCreations/alien-node-pg-utils/badge.svg?branch=master&service=github)](https://coveralls.io/github/AlienCreations/alien-node-pg-utils?branch=master) [![npm version](http://img.shields.io/npm/v/alien-node-pg-utils.svg)](https://npmjs.org/package/alien-node-pg-utils) [![Dependency Status](https://david-dm.org/AlienCreations/alien-node-pg-utils.svg)](https://david-dm.org/AlienCreations/alien-node-pg-utils)

## Install

```
$ npm install alien-node-pg-utils --save
```

Run the specs

```
$ npm test
```

## Methods

#### query()
Make a SQL query in which you expect zero or more results. Returns a promise which
either resolves to an array containing found records (as objects) or rejects if no records found. 

#### querySafe()
Same as query but resolves an empty array if no records found.

##### Suggested model usage: 
```js

'use strict';

const { Pool } = require('pg'),
      dbPool   = new Pool();
    
const DB                  = require('alien-node-pg-utils')(dbPool),
      validateAccountData = require('../some-validator');

const createAndExecuteQuery = status => {
  const query = 'SELECT * FROM accounts WHERE status = $1',
        queryStatement = [query, [status]];

  return DB.query(queryStatement);
};

/**
 * Query accounts based on status
 * @param {Number} status
 * @returns {Promise}
 */
const getAccountsByStatus = status => {
  validateAccountData({ status });
  return createAndExecuteQuery(status);
}

module.exports = getAccountsByStatus;
```

##### Suggested controller usage 

*(using DB.query)*

```js

const getAccountsByStatus = require('../models/getAccountsByStatus');

getAccountsByStatus('active').then(accounts => {
    // handle array of accounts here
  })
  .catch(err => {
    // handle "No records found" or other errors here
  });
  
```

*(using DB.querySafe)*

```js

const getAccountsByStatus = require('../models/getAccountsByStatus');

getAccountsByStatus('active').then(maybeAccounts => {
    // handle array of accounts or empty array here
  })
  .catch(err => {
    // handle errors here
  });
  
```

#### lookup()
Make a SQL query in which you expect zero or one result. Returns a promise which
either resolves to an object matching the row schema or rejects if no records found. 

#### lookupSafe()
Same as lookup, but resolves `undefined` if no records are found. 

```js

'use strict';

const { Pool } = require('pg'),
      dbPool   = new Pool();
    
const DB                  = require('alien-node-pg-utils')(dbPool),
      validateAccountData = require('../some-validator');

const createAndExecuteQuery = id => {
  const query = 'SELECT * FROM accounts WHERE id = $1',
        queryStatement = [query, [id]];

  return DB.lookup(queryStatement);
};

/**
 * Lookup account by id
 * @param {Number} id
 * @returns {Promise}
 */
const getAccountById = id => {
  validateAccountData({ id });
  return createAndExecuteQuery(id);
}

module.exports = getAccountById;
```

##### Suggested controller usage

*(using DB.lookup)*

```js

const getAccountById = require('../models/getAccountById');


getAccountById(1234).then(account => {
    // handle account object here
  })
  .catch(err => {
    // handle "No records found" or other errors here
  });
  
```

*(using DB.lookupSafe)*

```js

const getAccountById = require('../models/getAccountById');


getAccountById(1234).then(maybeAccount => {
    // handle account object or undefined here
  })
  .catch(err => {
    // handle errors here
  });
  
```

## Transactions
This library supports some simple transaction abstractions to play nicely with your promise chains. 

The three methods you need to care about are : 
 - DB.beginTransaction()
 - DB.addQueryToTransaction()
 - DB.commit()
 
These methods have a unique signature compared to the other methods for querying. Let's break them down: 
 
**DB.beginTransaction()** : `() -> Promise(connection)`

This method will use the curried `dbPool` object provided during require...

```js
const DB = require('alien-node-pg-utils')(dbPool);
```

... and internally call `getConnection()` on it, then resolve the connection on its promise.
 
This connection needs to be provided to the subsequent methods so the transaction knows how to commit and rollback. 
 
**DB.addQueryToTransaction()** : `connection -> query -> Promise({ data, connection })`

This method accepts the connection object which you should have gotten from `DB.beginTransaction()`, along with the typical query which you give to 
any other query method in this library. It behaves like `DB.querySafe()` in that it lets you 
deal with all the data scrubbing and null-checks (resolves zero-or-more result sets and all `SELECT` statements
return an array). 

Please notice that this method returns the connection along with the data, so in the spirit of 
keeping the unary promise chain data flow in mind, the promise will resolve a single object, 
where the data lives in a `data` property, and the connection on a `connection` property.

**DB.commit()** : `connection`

This method accepts the connection object which you should have gotten from `DB.beginTransaction()`. It simply 
resolves `true` if there are no errors, otherwise it rejects the promise with whatever error may happen to ruin your day.

##### Suggested wrapper-model usage for transactions

```js
const DB = require('alien-node-pg-utils')(dbPool);

const getUserBalance = id => connection => {
    const query          = 'SELECT balance FROM users WHERE id =$1',
          queryStatement = [query, [id]];
  
    return DB.addQueryToTransaction(connection, queryStatement);
};

const updateUserBalance = (id, amount) => connection => {
    const query          = 'UPDATE users SET balance = balance + $1 WHERE id = $2',
          queryStatement = [query, [amount, id]];
  
    return DB.addQueryToTransaction(connection, queryStatement);
};

const ensurePositiveTransfer = amount => connection => {
  if (amount > 0) {
    return connection;
  } else {
      throw { 
        error : new Error('What are you doing?'),
        connection
      };
  };
};

const ensureEnoughMoney = amount => transaction => {
  const data    = transaction.data || [{ balance : 0 }],
        balance = data[0].balance  || 0;
  
  if (amount <= balance) {
    return transaction;
  } else {
    throw { 
      error      : new Error('Broke ass' ),
      connection : transaction.connection
    };
  }
};

const senderUserId   = 1234,
      receiverUserId = 5678,
      amountToSend   = 500.45;

const resolveConnection = o => o.connection;

DB.beginTransaction()
  .then(ensurePositiveTransfer(amountToSend))
  .then(getUserBalance(senderUserId))
  .then(ensureEnoughMoney(amountToSend))
  .then(resolveConnection)
  .then(updateUserBalance(senderUserId, amountToSend * -1))
  .then(resolveConnection)
  .then(updateUserBalance(receiverUserId, amountToSend))
  .then(resolveConnection)
  .then(DB.commit)
  .catch(exception => {
    exception.connection.rollback();
    logger.error(exception.error);
  });
 
```
## TODO 
 - Make the transform to/from column methods unbiased with decorator injection
