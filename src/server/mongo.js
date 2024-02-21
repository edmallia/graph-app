//TODO place in an apporpriate location
import { MongoClient } from "mongodb";
// Replace the uri string with your connection string.
const uri = "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=replset";
const client = new MongoClient(uri);

const db = client.db("graph");
const collName = "data"
const coll = db.collection(collName);

/** 
 * Indexes Required on data collection
 * For fetching of Assets by type and sorted by name: 
 *    {type:1, name:1}
 * For graph fetching:
 *    {name: 1} - initial match
 *    {"relations.r": 1}
 * i.e.
  db.data.createIndex({type:1, name:1})
  db.data.createIndex({name:1})
  db.data.createIndex({"relations.r": 1})
 */

let matchByNameStage = function (name) {
  return { $match: { name: name } };
};

let graphLookup = {
  $graphLookup: {
    from: collName,
    startWith: "$_id",
    connectFromField: "relations.r",
    connectToField: "_id",
    as: "connections",
    depthField: "depth",
  },
};

let reverseGraphLookup = {
  $graphLookup: {
    from: collName,
    startWith: "$_id",
    connectFromField: "_id",
    connectToField: "relations.r",
    as: "connections",
    depthField: "depth",
  },
};

let unwindConnections = { $unwind: "$connections" };

let replaceRoot = { $replaceRoot: { newRoot: "$connections" } };

let setAssetName = function(name){
  return {$set : {assetName: name}}
}

let unwindRelations = {
  $unwind: { path: "$relations", preserveNullAndEmptyArrays: true },
};

export let group = {
  $group: {
    _id: null,
    vertices: { $addToSet: { id: "$name", type: "$type", data: { label: "$name" } } },
    edges: {
      $addToSet: {
        source: "$name",
        target: "$relations.r.n",
        label: "$relations.d",
      },
    },
  }
};

export let projectOutId = {
  $project : {_id : 0}
}

/*
[
  { '$match': { name: 'Toro Company' } },
  {
    '$graphLookup': {
      from: 'data',
      startWith: '$_id',
      connectFromField: 'relations.r',
      connectToField: '_id',
      as: 'connections',
      depthField: 'depth'
    }
  },
  { '$unwind': '$connections' },
  { '$replaceRoot': { newRoot: '$connections' } },
  {
    '$unwind': { path: '$relations', preserveNullAndEmptyArrays: true }
  },
  {
    '$unionWith': {
      coll: 'data',
      pipeline: [
        { '$match': { name: 'Toro Company' } },
        {
          '$graphLookup': {
            from: 'data',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'relations.r',
            as: 'connections',
            depthField: 'depth'
          }
        },
        { '$unwind': '$connections' },
        { '$replaceRoot': { newRoot: '$connections' } },
        {
          '$unwind': { path: '$relations', preserveNullAndEmptyArrays: true }
        }
      ]
    }
  },
  {
    '$group': {
      _id: null,
      vertices: { '$addToSet': { id: '$name', data: { label: '$name' } } },
      edges: {
        '$addToSet': {
          source: '$name',
          target: '$relations.r.n',
          type: 'edgeType',
          label: '$relations.d'
        }
      }
    }
  },
  { '$set': { assetName: 'Toro Company' } },
  { '$project': { _id: 0 } }
]
*/

let unionStage = function(name){
  let subpipeline = [
    matchByNameStage(name),
    reverseGraphLookup,
    unwindConnections,
    replaceRoot,
    unwindRelations,
  ]

  return {
    '$unionWith' : 
      {
        coll: "data",
        pipeline: subpipeline
      }
  }  
}

export let fetchGraph = async function (name) {
  console.log("Fetching graph for: " + name);
  let pipeline = [
    matchByNameStage(name),
    graphLookup,
    unwindConnections,
    replaceRoot,
    unwindRelations,
    unionStage(name),
    group,
    setAssetName(name),
    projectOutId
  ];

  console.log(JSON.stringify(pipeline));

  const result = await coll.aggregate(pipeline);
  return result.toArray()
};


let cleanSkip = function(skip){
  if (!skip){ 
    return 0 
  }
  else if (typeof skip === "string"){
    return Number(skip)
  }
  return skip
}

export let fetchUsers = async function(skip){
  let query = { type: 'USER'};

  skip = cleanSkip(skip)

  let options = {
    projection: {_id:0, name:1},
    sort : {name:1},
    limit: 100,
    skip: skip
  };
  
  const result = await coll.find(query,options)
  return result.toArray()
}

export let fetchRoles = async function(skip){
  let query = { type: 'ROLE'};

  skip = cleanSkip(skip)

  let options = {
    projection: {_id:0, name:1},
    sort : {name:1},
    limit : 100,
    skip: skip
  };

  const result = await coll.find(query,options)
  return result.toArray()
}

export let fetchBuckets = async function(skip){
  let query = { type: 'BUCKET'};

  skip = cleanSkip(skip)

  let options = {
    projection: {_id:0, name:1},
    sort : {name:1},
    limit: 100,
    skip: skip
  };

  const result = await coll.find(query,options)
  return result.toArray()
}
