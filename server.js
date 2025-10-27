// Step 1: Dependencies import karna
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000; 

// Step 2: Global Data
const MAX_PLACES = 10; // Sirf purane 10 places
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

// Step 3: Helper Functions
function getPlaceIndex(name) {
    return places.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
}

function greedyMatch(riderIndex) {
    let minDist = INF;
    let nearestDriverIndex = -1;
    const driverLocations = [0, 2, 4, 6, 8]; 

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
            // Dijkstra Logic Fix: dist[u][v] > 0 check kiya
            if (!visited[v] && dist[u][v] > 0 && distance[u] !== INF && distance[u] + dist[u][v] < distance[v]) {
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
    
    if (distance[end] !== INF) {
        path.push(places[start].name);
        return { path: path.reverse().join(' -> '), distance: distance[end] };
    } else {
        return { path: "No optimal path found between these two locations.", distance: INF };
    }
}

// Step 4: Express Server Setup
app.use(express.static(path.join(__dirname))); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Homepage route - `index.html` serve karega
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// LOGIN ROUTE:
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // DUMMY LOGIN LOGIC: Assuming successful if data is provided
    if (username && password) {
        console.log(`User logged in: ${username}`);
        // Redirect to ride page on success
        return res.redirect('/ride.html'); 
    } else {
        return res.status(400).send('Login failed. Please provide username and password.');
    }
});

// SIGNUP ROUTE:
app.post('/signup', (req, res) => {
    // Hum form se username, email, aur password lenge
    const { username, email, password } = req.body;

    // --- DUMMY SIGNUP LOGIC ---
    if (username && email && password) {
        console.log(`New user signed up: ${username} with email ${email}`);
        
        // Signup successful hone par, hum user ko seedha ride page par bhej denge.
        return res.redirect('/ride.html'); 
    } else {
        // Agar koi field missing hai
        return res.status(400).send('Signup failed. Please provide all details.');
    }
});

// API Endpoint: Ride optimization
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

    const driverMatch = greedyMatch(riderIndex);
    
    if (driverMatch.driverIndex === -1 || driverMatch.distance === INF) {
        return res.status(400).json({ error: 'No nearest driver found for the selected pickup location.' });
    }

    const route = dijkstra(driverMatch.driverIndex, destIndex);

    if (route.distance === INF) {
         return res.status(400).json({ error: 'No complete route found from the nearest driver to the destination.' });
    }

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