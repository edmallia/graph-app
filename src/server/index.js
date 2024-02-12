import express from 'express'; 
export const app = express();

import { fetchGraph, fetchUsers, fetchRoles, fetchBuckets } from './mongo';

app.get('/api/assets/users', async (_, res) => 
    { 
        let assets = await fetchUsers();
        return res.json(assets)
    }
)

app.get('/api/assets/roles', async (_, res) => 
    { 
        let assets = await fetchRoles();
        return res.json(assets)
    }
)

app.get('/api/assets/buckets', async (_, res) => 
    { 
        let assets = await fetchBuckets();
        return res.json(assets)
    }
)

app.get('/api/asset/:assetId/graph', async (req, res) => 
    { 
        let graph = await fetchGraph(req.params.assetId);
        console.log(graph);
        return res.json(graph[0])
    }
)