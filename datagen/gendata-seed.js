// Load Chance
// const Chance = require('chance');
import Chance from 'chance';

// Instantiate Chance so it can be used
const chance = new Chance();

import fs from 'node:fs';

const noOfUsers = 500;
const noOfRoles = 300;
const noOfBuckets = 500;

let result = {
    "users" : [],
    "roles" : [],
    "permissions" : ["READ", "WRITE", "DELETE", "MANAGE"],
    "buckets" : [],
    "payloads" : ["FINANCIAL", "PII", "CREDENTIALS"]
}


result.users = chance.unique(chance.name, noOfUsers);
result.roles = chance.unique(chance.profession, noOfRoles)
result.buckets = chance.unique(chance.company, noOfBuckets)

fs.writeFile('datagen/seed.json', JSON.stringify(result), err => {
  if (err) {
    console.error(err);
  } else {
    // file written successfully
  }
});