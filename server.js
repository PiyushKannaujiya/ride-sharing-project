// Step 1: Dependencies import karna
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Step 2: Global Data (C code se copy kiya hua)
const MAX_PLACES = 10;
const INF = 9999;

const places = [
    { name: "Banjara Hills" }, { name: "Madhapur" }, { name: "Kukatpally" },
    { name: "Charminar" }, { name: "Gachibowli" }, { name: "Begumpet" },
    { name: "Secunderabad" }, { name: "Ameerpet" }, { name: "Hitech City" },
    { name: "Dilsukhnagar" }
];

const dist = [
    [0, 8, 10, 15, 12, 6, 11, 5, 9, 14], [8, 0, 7, 20, 5, 10, 13, 9, 3, 16],
    [10, 7, 0, 22, 8, 9, 12, 6, 5, 18], [15, 20, 22, 0, 25, 19, 16, 21, 23, 9],
    [12, 5, 8, 25, 0, 11, 15, 7, 4, 20], [6, 10, 9, 19, 11, 0, 8, 4, 10, 13],
    [11, 13, 12, 16, 15, 8, 0, 10, 9, 14], [5, 9, 6, 21, 7, 4, 10, 0, 8, 15],
    [9, 3, 5, 23, 4, 10, 9, 8, 0, 17], [14, 16, 18, 9, 20, 13, 14, 15, 17, 0]
];

// Step 3: Helper Functions (JavaScript mein)
function getPlaceIndex(name) {
    return places.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
}

// C code ka Greedy Match logic ab JavaScript mein
function greedyMatch(riderIndex) {
    let minDist = INF;
    let nearestDriverIndex = -1;
    const driverLocations = [0, 2, 4, 6, 8]; // Sample driver locations

    for (let i = 0; i < driverLocations.length; i++) {
        const driverLocIndex = driverLocations[i];
        const d = dist[riderIndex][driverLocIndex];
        if (d < minDist) {
            minDist = d;
            nearestDriverIndex = driverLocIndex;
        }
    }
    return { driverIndex: nearestDriverIndex, distance: minDist };
}

// C code ka Dijkstra Algorithm ab JavaScript mein
function dijkstra(start, end) {
    let distance = new Array(MAX_PLACES).fill(INF);
    let pred = new Array(MAX_PLACES).fill(-1);
    let visited = new Array(MAX_PLACES).fill(false);
    
    distance[start] = 0;
    pred[start] = start;

    for (let count = 0; count < MAX_PLACES - 1; count++) {
        let minDist = INF;
        let u = -1;

        for (let i = 0; i < MAX_PLACES; i++) {
            if (!visited[i] && distance[i] <= minDist) {
                minDist = distance[i];
                u = i;
            }
        }
        
        if (u === -1) break;
        visited[u] = true;
        
        for (let v = 0; v < MAX_PLACES; v++) {
            if (!visited[v] && dist[u][v] && distance[u] !== INF && distance[u] + dist[u][v] < distance[v]) {
                distance[v] = distance[u] + dist[u][v];
                pred[v] = u;
            }
        }
    }

    // Path ko reconstruct karna
    let path = [];
    let crawl = end;
    while (crawl !== start && crawl !== -1) {
        path.push(places[crawl].name);
        crawl = pred[crawl];
    }
    path.push(places[start].name);
    
    return { path: path.reverse().join(' -> '), distance: distance[end] };
}

// Step 4: Express Server Setup
app.use(express.static(path.join(__dirname))); // HTML/CSS files serve karne ke liye
app.use(express.urlencoded({ extended: true })); // Form data parse karne ke liye
app.use(express.json()); // JSON parse karne ke liye

// Homepage route - `index.html` serve karega
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Endpoint: Yahaan par ride optimization ka logic chalega
app.post('/api/optimize-ride', (req, res) => {
    const { pickup, destination } = req.body;

    if (!pickup || !destination) {
        return res.status(400).json({ error: 'Pickup and destination are required.' });
    }

    const riderIndex = getPlaceIndex(pickup);
    const destIndex = getPlaceIndex(destination);

    if (riderIndex === -1 || destIndex === -1) {
        return res.status(400).json({ error: 'Invalid location entered.' });
    }

    // Logic execute karo
    const driverMatch = greedyMatch(riderIndex);
    const route = dijkstra(driverMatch.driverIndex, destIndex);

    // Result JSON format mein bhejo
    res.json({
        riderLocation: places[riderIndex].name,
        driverLocation: places[driverMatch.driverIndex].name,
        driverDistanceKm: driverMatch.distance,
        destination: places[destIndex].name,
        optimalPath: route.path,
        totalDistanceKm: route.distance
    });
});

// Server ko start karo
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});