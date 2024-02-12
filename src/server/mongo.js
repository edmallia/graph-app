//TODO place in an apporpriate location
// const { MongoClient } = require("mongodb");
import { MongoClient } from "mongodb";
// Replace the uri string with your connection string.
const uri = "mongodb://localhost:27017/?replicaSet=replset";
const client = new MongoClient(uri);

const db = client.db("graph");
const coll = db.collection("data");


export let matchByNameStage = function (name) {
  return { $match: { name: name } };
};

let graphLookup = {
  $graphLookup: {
    from: "data",
    startWith: "$_id",
    connectFromField: "relations.r",
    connectToField: "_id",
    as: "connections",
    depthField: "depth",
  },
};

let unwindConnections = { $unwind: "$connections" };

let replaceRoot = { $replaceRoot: { newRoot: "$connections" } };

let unwindRelations = {
  $unwind: { path: "$relations", preserveNullAndEmptyArrays: true },
};

export let group = {
  $group: {
    _id: null,
    vertices: { $addToSet: { id: "$name", data: { label: "$name" } } },
    edges: {
      $addToSet: {
        source: "$name",
        target: "$relations.r.n",
        type: "edgeType",
        label: "$relations.d",
      },
    },
  }
};

export let projectOutId = {
  $project : {_id : 0}
}

export let fetchGraph = async function (name) {
  console.log(name);
  let pipeline = [
    matchByNameStage(name),
    graphLookup,
    unwindConnections,
    replaceRoot,
    unwindRelations,
    group,
    projectOutId
  ];

  console.log(JSON.stringify(pipeline));

  const result = await coll.aggregate(pipeline);
  return result.toArray()
};


export let fetchUsers = async function(){
  let query = { type: 'USER'};

  let options = {
    projection: {_id:0, name:1},
    sort : {name:1}
  };

  const result = await coll.find(query,options)
  return result.toArray()
}

export let fetchRoles = async function(){
  let query = { type: 'ROLE'};

  let options = {
    projection: {_id:0, name:1},
    sort : {name:1}
  };

  const result = await coll.find(query,options)
  return result.toArray()
}

export let fetchBuckets = async function(){
  let query = { type: 'BUCKET'};

  let options = {
    projection: {_id:0, name:1},
    sort : {name:1}
  };

  const result = await coll.find(query,options)
  return result.toArray()
}