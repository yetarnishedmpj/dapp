#include "httplib.h"
#include <iostream>
#include <string>

int main() {
    httplib::Server svr;

    // Marketplace Statistics Endpoint
    svr.Get("/api/stats", [](const httplib::Request&, httplib::Response& res) {
        std::string json = "{\"totalItems\": 150, \"activeAuctions\": 12, \"totalVolume\": 12.5, \"currency\": \"ETH\"}";
        res.set_content(json, "application/json");
        res.set_header("Access-Control-Allow-Origin", "*");
    });

    // High Performance Item Retrieval Endpoint
    svr.Get("/api/items", [](const httplib::Request&, httplib::Response& res) {
        std::string json = "[{\"itemId\": 1, \"name\": \"C++ Cyber Art #1\", \"description\": \"A masterpiece indexed by the C++ backend.\", \"price\": \"0.05\", \"category\": \"Art\", \"image\": \"https://gateway.pinata.cloud/ipfs/Qmc\"}]";
        res.set_content(json, "application/json");
        res.set_header("Access-Control-Allow-Origin", "*");
    });

    // Health Check
    svr.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        res.set_content("C++ Backend is healthy and running!", "text/plain");
    });

    // Handle OPTIONS for CORS
    svr.Options("/(.*)", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        res.status = 204;
    });

    std::cout << "Starting C++ Marketplace Backend on port 8080..." << std::endl;
    svr.listen("0.0.0.0", 8080);

    return 0;
}
