import express from 'express'; 
export const app = express();

import { fetchGraph, fetchUsers, fetchRoles, fetchBuckets } from './mongo';

app.get('/api/assets/users', async (req, res) => 
    { 
        let assets = await fetchUsers(req.query.skip);
        return res.json(assets)
    }
)

app.get('/api/assets/roles', async (req, res) => 
    { 
        let assets = await fetchRoles(req.query.skip);
        return res.json(assets)
    }
)

app.get('/api/assets/buckets', async (req, res) => 
    { 
        let assets = await fetchBuckets(req.query.skip);
        return res.json(assets)
    }
)

app.get('/api/asset/:assetId/graph', async (req, res) => 
    { 
        let graph = await fetchGraph(req.params.assetId);
        return res.json(graph[0])
    }
)