// netlify/functions/cors-proxy.js

import fetch from "node-fetch";

export async function handler(event, context) {
    // Only allow GET requests
    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            body: "Method Not Allowed",
        };
    }

    // Get the URL to proxy from the query parameters
    const url = event.queryStringParameters.url;
    if (!url) {
        return {
            statusCode: 400,
            body: "Missing URL parameter",
        };
    }

    try {
        // Validate URL
        // const urlObj = new URL(url);

        // Optional: Add allowed domains check
        // const allowedDomains = ['api.example.com'];
        // if (!allowedDomains.includes(urlObj.hostname)) {
        //   return {
        //     statusCode: 403,
        //     body: 'Domain not allowed'
        //   };
        // }

        // Make the request to the target URL
        const response = await fetch(url);
        const data = await response.text();

        // Return the proxied response with CORS headers
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET",
                "Content-Type": response.headers.get("content-type"),
            },
            body: data,
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: "Error: " + err.message,
        };
    }
}
