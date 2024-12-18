exports.handler = async function (event, context) {
    const { default: fetch } = await import("node-fetch");

    // Only allow GET requests
    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            body: "Method Not Allowed",
        };
    }

    // if (event.headers["proxy-token"] !== "pUSicWPDbwcz141BdtDjG88RAgGqOcrFhwp9PLGJ5RqzuWOV8VxTwPVvavwLYIoZ") {
    //     return {
    //         statusCode: 403,
    //         body: "Invalid token",
    //     };
    // }

    // Get the URL to proxy from the query parameters
    const url = event.queryStringParameters.url;
    if (!url) {
        return {
            statusCode: 400,
            body: "Missing URL parameter",
        };
    }

    try {
        // Make the request to the target URL
        const response = await fetch(url);

        // Get the content type and check if it's binary
        const contentType = response.headers.get("content-type");

        let body;
        if (
            contentType &&
            (contentType.includes("image") ||
                contentType.includes("audio") ||
                contentType.includes("video") ||
                contentType.includes("application/pdf") ||
                contentType.includes("application/octet-stream"))
        ) {
            // Handle binary data
            const buffer = await response.buffer();
            body = buffer.toString("base64");

            // Return the proxied response with CORS headers and base64 encoding
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "GET",
                    "Content-Type": contentType,
                    "X-Binary-Content": "true", // Flag to indicate binary content
                    "Cache-Control": "public, max-age=3600", // Optional caching
                },
                body: body,
                isBase64Encoded: true,
            };
        } else {
            // Handle text-based data
            body = await response.text();

            // Return the proxied response with CORS headers
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "GET",
                    "Content-Type": contentType || "text/plain",
                    "Cache-Control": "public, max-age=3600", // Optional caching
                },
                body: body,
            };
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: "Error: " + err.message,
        };
    }
};
