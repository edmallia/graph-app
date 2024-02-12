/****************************************************************************************************
 * Creates data based on the supplied entities in the seed file. The data is
 * created based on the following rules,
 *
 *  - For all Users in the Seed File
 *      - Create a User
 *      - Link User to a random number of buckets with a maximum of maxBucketPerUserOrRole
 *          - For each link, assign a random permission extract from the seed file
 *      - Link User to a random number of roles with a maximum of maxRolePerUser
 *
 *  - For all Roles in the Seed File
 *      - Create a Role
 *      - Link Role to a random number of buckets with a maximum of maxBucketPerUserOrRole
 *          - For each link, assign a random permission extract from the seed file
 *      - NOTE: adding Roles to Users only (and not other Roles) as otherwise we get state explosion in the random data generation.
 *
 *  - For all Buckets in the Seed File
 *      - Create Bucket
 *      - Link Bucket to a random number of payload types
 *
 *  - For all Payload (type) in the Seed File
 *      - Create a Payload (type)
 *
 *  - Thus, data is linked uni directional as follow
 *
 *
 * +--------+      Has Access to      +---------+  Contains Payload  +-----------+
 * |        |      with Permission    |         |         Type       |           |
 * |  User  +------------------------>|  Bucket +------------------->|  Payload  |
 * |        |                         |         |                    |           |
 * +----+---+                         +---------+                    +-----------+
 *      |                                  ^
 *      |                                  |
 *      |             +---------+          | Has Access To
 *      |             |         |          | with Permission
 *      +-------------+  Role   +----------+
 *        Is Assigned |         |
 *                    +---------+
 *
 ****************************************************************************************************/

// Load Chance
import Chance from "chance";

// Instantiate Chance so it can be used
const chance = new Chance();

import { MongoClient } from "mongodb";

// Replace the uri string with your connection string.
const uri = "mongodb://localhost:27017/?replicaSet=replset";
const client = new MongoClient(uri);

const logOutput = false;

import fs from "node:fs";
const seed = loadSeed("./datagen/seed.json");


log("Starting data generation process ...");
log("______________________________________________");
log("Seed file ...");
log("______________________________________________");
logObject(seed);
log("______________________________________________");

const maxBucketPerUserOrRole = 5;
const maxRolePerUser = 5;

const docs = [];

//generate data for all users
seed.users.forEach((u) => {
  let obj = {};
  obj.type = "USER";
  obj.name = u;
  obj._id = { t: obj.type, n: obj.name };
  obj.relations = [];

  addBucketRelations(obj);
  addRoleRelations(obj);

  logObject(obj);
  docs.push(obj);
});

//generate data for all roles
seed.roles.forEach((r) => {
  let obj = {};
  obj.type = "ROLE";
  obj.name = r;
  obj._id = { t: obj.type, n: obj.name };
  obj.relations = [];

  addBucketRelations(obj);

  logObject(obj);

  docs.push(obj);
});

//generate data for all buckets
seed.buckets.forEach((b) => {
  let obj = {};
  obj.type = "BUCKET";
  obj.name = b;
  obj._id = { t: obj.type, n: obj.name };
  obj.relations = [];

  addPayloadRelations(obj);

  logObject(obj);

  docs.push(obj);
});

//generate data for all payloads
seed.payloads.forEach((b) => {
  let obj = {};
  obj.type = "PAYLOAD";
  obj.name = b;
  obj._id = { t: obj.type, n: obj.name };
  obj.relations = [];

  logObject(obj);

  docs.push(obj);
});

saveData().catch(console.dir);

async function saveData() {
  try {
    const database = client.db("graph");
    const coll = database.collection("data");

    await coll.insertMany(docs);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

function addBucketRelations(obj) {
  let max = Math.min(maxBucketPerUserOrRole, seed.buckets.length);
  let directAccessResource = chance.pickset(
    seed.buckets,
    chance.integer({ min: 1, max: max })
  );
  directAccessResource.forEach((resource) => {
    let permission = chance.pickone(seed.permissions);
    obj.relations.push({ r: { t: "BUCKET", n: resource }, d: permission });
  });
}

function addRoleRelations(obj) {
  let rolesToChooseFrom = seed.roles;
  if (rolesToChooseFrom.length >= 1) {
    let max = Math.min(maxRolePerUser, rolesToChooseFrom.length);
    let roles = chance.pickset(
      rolesToChooseFrom,
      chance.integer({ min: 1, max: max })
    );
    roles.forEach((resource) => {
      obj.relations.push({ r: { t: "ROLE", n: resource }, d: null });
    });
  }
}

function addPayloadRelations(obj) {
  let payloads = chance.pickset(
    seed.payloads,
    chance.integer({ min: 1, max: seed.payloads.length })
  );
  payloads.forEach((payload) => {
    obj.relations.push({ r: { t: "PAYLOAD", n: payload }, d: null });
  });
}

function log(txt) {
  console.log(txt);
}

function logObject(obj, txt) {
  if (logOutput) {
    if (txt) {
      console.log(txt);
    }

    console.dir(obj, { depth: null });
  }
}

function loadSeed(filename) {
  log("starting to read file");
  try {
    const data = fs.readFileSync(filename, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(err);
  }
}
