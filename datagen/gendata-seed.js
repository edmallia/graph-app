// Load Chance
// const Chance = require('chance');
import Chance from 'chance';

// Instantiate Chance so it can be used
const chance = new Chance();

import fs from 'node:fs';

const noOfUsers = 1000; 
const noOfRoles = 389; //389 is the largest possible number, imposed by the underlying chance.js
const noOfBuckets = 947; //947 is the largest possible number, imposed by the underlying chance.js

const result = {
    "users" : [],
    "roles" : [],
    "permissions" : ["READ", "WRITE", "DELETE", "MANAGE"],
    "buckets" : [],
    "payloads" : ["FINANCIAL", "PII", "CREDENTIALS"]
}

const outputFile = 'datagen/seed.json';

result.users = chance.unique(chance.name, noOfUsers);
result.roles = chance.unique(chance.profession, noOfRoles)
result.buckets = chance.unique(chance.company, noOfBuckets)

fs.writeFile(outputFile, JSON.stringify(result), err => {
  if (err) {
    console.error(err);
  } else {
    // file written successfully
  }
});