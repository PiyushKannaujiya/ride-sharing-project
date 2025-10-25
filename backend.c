#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include "cJSON.h"
#define MAX_PLACES 10
#define INF 9999

// ====== STRUCTS ======
typedef struct {
    char name[30];
} Place;

typedef struct {
    int id;
    char name[30];
    char vehicle_type[10];
    char vehicle_model[20];
    char location[30];
} Driver;

// ====== GLOBAL DATA ======
Place places[MAX_PLACES] = {
    {"Banjara Hills"},
    {"Madhapur"},
    {"Kukatpally"},
    {"Charminar"},
    {"Gachibowli"},
    {"Begumpet"},
    {"Secunderabad"},
    {"Ameerpet"},
    {"Hitech City"},
    {"Dilsukhnagar"}
};

// Sample distance matrix (in km between places)
// INF = No direct road (for simplicity)
int dist[MAX_PLACES][MAX_PLACES] = {
    {0, 8, 10, 15, 12, 6, 11, 5, 9, 14},
    {8, 0, 7, 20, 5, 10, 13, 9, 3, 16},
    {10, 7, 0, 22, 8, 9, 12, 6, 5, 18},
    {15, 20, 22, 0, 25, 19, 16, 21, 23, 9},
    {12, 5, 8, 25, 0, 11, 15, 7, 4, 20},
    {6, 10, 9, 19, 11, 0, 8, 4, 10, 13},
    {11, 13, 12, 16, 15, 8, 0, 10, 9, 14},
    {5, 9, 6, 21, 7, 4, 10, 0, 8, 15},
    {9, 3, 5, 23, 4, 10, 9, 8, 0, 17},
    {14, 16, 18, 9, 20, 13, 14, 15, 17, 0}
};

// ====== DIJKSTRA ALGORITHM ======
void dijkstra(int start, int end) {
    int cost[MAX_PLACES][MAX_PLACES], distance[MAX_PLACES], pred[MAX_PLACES];
    int visited[MAX_PLACES], count, mindistance, nextnode, i, j;

    // Prepare cost matrix
    for (i = 0; i < MAX_PLACES; i++)
        for (j = 0; j < MAX_PLACES; j++)
            cost[i][j] = (dist[i][j] == 0) ? INF : dist[i][j];

    // Initialize
    for (i = 0; i < MAX_PLACES; i++) {
        distance[i] = cost[start][i];
        pred[i] = start;
        visited[i] = 0;
    }

    distance[start] = 0;
    visited[start] = 1;
    count = 1;

    // Main Dijkstra logic
    while (count < MAX_PLACES - 1) {
        mindistance = INF;

        for (i = 0; i < MAX_PLACES; i++)
            if (distance[i] < mindistance && !visited[i]) {
                mindistance = distance[i];
                nextnode = i;
            }

        visited[nextnode] = 1;

        for (i = 0; i < MAX_PLACES; i++)
            if (!visited[i])
                if (mindistance + cost[nextnode][i] < distance[i]) {
                    distance[i] = mindistance + cost[nextnode][i];
                    pred[i] = nextnode;
                }

        count++;
    }

    // Print shortest path
    printf("\n Shortest distance: %d km", distance[end]);
    printf("\n Path: %s", places[end].name);

    j = end;
    do {
        j = pred[j];
        printf(" <- %s", places[j].name);
    } while (j != start);
    printf("\n");
}

// ====== GREEDY MATCHING LOGIC ======
int greedyMatch(int riderIndex) {
    int minDist = INF, nearestDriver = -1;

    // Random sample drivers’ locations
    int driverLocations[5] = {0, 2, 4, 6, 8}; // Banjara Hills, Kukatpally, Gachibowli, Secunderabad, Hitech City

    for (int i = 0; i < 5; i++) {
        int d = dist[riderIndex][driverLocations[i]];
        if (d < minDist) {
            minDist = d;
            nearestDriver = driverLocations[i];
        }
    }

    printf("\nNearest driver is at %s (%d km away)\n", places[nearestDriver].name, minDist);
    return nearestDriver;
}

// ====== MAIN FUNCTION ======
int main() {
    char riderPlace[30];
    int riderIndex = -1, destIndex = -1;

    printf("=== Ride Sharing Optimizer Backend ===\n");
    printf("Available places in Hyderabad:\n");
    for (int i = 0; i < MAX_PLACES; i++)
        printf("%d. %s\n", i + 1, places[i].name);

    printf("\nEnter your pickup location: ");
    fgets(riderPlace, sizeof(riderPlace), stdin);
    riderPlace[strcspn(riderPlace, "\n")] = 0; // remove newline

    // Find index of rider place
    for (int i = 0; i < MAX_PLACES; i++)
        if (strcasecmp(riderPlace, places[i].name) == 0)
            riderIndex = i;

    if (riderIndex == -1) {
        printf(" Invalid location entered.\n");
        return 0;
    }

    int driverIndex = greedyMatch(riderIndex);

    printf("\nEnter your destination: ");
    char destPlace[30];
    fgets(destPlace, sizeof(destPlace), stdin);
    destPlace[strcspn(destPlace, "\n")] = 0;

    for (int i = 0; i < MAX_PLACES; i++)
        if (strcasecmp(destPlace, places[i].name) == 0)
            destIndex = i;

    if (destIndex == -1) {
        printf(" Invalid destination.\n");
        return 0;
    }

    printf("\nFinding best route using Dijkstra’s Algorithm...");
    dijkstra(driverIndex, destIndex);

    printf("\n Ride Optimized Successfully!\n");
    return 0;
}
