const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration for ngrok compatibility
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Allow localhost, ngrok, and Render domains
        const allowedOrigins = [
            'http://localhost:3000',
            'https://localhost:3000',
            /^https:\/\/.*\.ngrok\.io$/,
            /^https:\/\/.*\.ngrok-free\.app$/,
            /^http:\/\/.*\.ngrok\.io$/,
            /^http:\/\/.*\.ngrok-free\.app$/,
            /^https:\/\/.*\.onrender\.com$/
        ];
        
        const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') {
                return origin === allowed;
            }
            return allowed.test(origin);
        });
        
        console.log(`CORS check - Origin: ${origin}, Allowed: ${isAllowed}`);
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(null, true); // Allow anyway for debugging
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With', 
        'Content-Type', 
        'Accept', 
        'Authorization',
        'Cache-Control',
        'Pragma',
        'X-Forwarded-For',
        'X-Forwarded-Proto'
    ],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', {
        origin: req.headers.origin,
        'user-agent': req.headers['user-agent'],
        authorization: req.headers.authorization ? 'Bearer [REDACTED]' : 'None'
    });
    next();
});

app.use(express.json());

// Serve index explicitly for root requests (Render health checks)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Respond to HEAD / for health checks
app.head('/', (req, res) => {
    res.status(200).end();
});

// Explicit preflight handler for complex requests
app.options('*', (req, res) => {
    console.log('Preflight request received for:', req.url);
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.sendStatus(204);
});

// Additional security headers
app.use((req, res, next) => {
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static files from current directory
app.use(express.static('.'));

// OAuth token exchange endpoint
app.post('/api/docusign/oauth/token', async (req, res) => {
    try {
        const { code, clientId, redirectUri, clientSecret } = req.body;
        
        if (!code || !clientId || !redirectUri) {
            return res.status(400).json({ 
                error: 'Missing required parameters', 
                message: 'code, clientId, and redirectUri are required' 
            });
        }

        console.log('=== OAuth Token Exchange ===');
        console.log('Client ID:', clientId);
        console.log('Redirect URI:', redirectUri);
        console.log('Authorization Code:', code.substring(0, 10) + '...');

        // Exchange authorization code for access token
        const requestBody = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            client_id: clientId
        });

        // Add client secret if provided (for confidential clients)
        if (clientSecret) {
            requestBody.append('client_secret', clientSecret);
        }

        const tokenResponse = await fetch('https://account-d.docusign.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: requestBody
        });

        if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            console.log('Token exchange successful!');
            
            // Ensure CORS headers are set
            res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.header('Access-Control-Allow-Credentials', 'true');
            res.json(tokenData);
        } else {
            const errorText = await tokenResponse.text();
            console.error('Token exchange failed:', tokenResponse.status, errorText);
            res.status(tokenResponse.status).json({ 
                error: 'Token exchange failed', 
                status: tokenResponse.status,
                details: errorText 
            });
        }
    } catch (error) {
        console.error('OAuth token exchange error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
});

// Proxy endpoint for Docusign CLM API
app.post('/api/docusign/workflows', async (req, res) => {
    try {
        const { token, payload, accountId } = req.body;
        
        if (!accountId) {
            return res.status(400).json({
                error: 'Account ID required',
                message: 'Please provide your Docusign CLM Account ID in the Admin panel'
            });
        }
        
        console.log('=== Docusign CLM Workflow Request ===');
        console.log('Origin:', req.headers.origin);
        console.log('User-Agent:', req.headers['user-agent']);
        console.log('Token present:', !!token);
        console.log('Account ID:', accountId);
        console.log('Payload:', JSON.stringify(payload, null, 2));
        
        const response = await fetch(
            `https://apiuatna11.springcm.com/v2/${accountId}/workflows`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify(payload)
            }
        );
        
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('=== API Error Response ===');
            console.error('Status:', response.status);
            console.error('Status Text:', response.statusText);
            console.error('Response Headers:', Object.fromEntries(response.headers.entries()));
            
            // Try to get the full error response body
            let errorResponseText = '';
            try {
                errorResponseText = await response.text();
                console.error('Full Error Response Body:', errorResponseText);
                
                // Try to parse as JSON for better error details
                try {
                    const errorJson = JSON.parse(errorResponseText);
                    console.error('Parsed Error JSON:', errorJson);
                } catch (parseError) {
                    console.error('Could not parse error response as JSON:', parseError.message);
                }
            } catch (readError) {
                console.error('Could not read error response body:', readError.message);
            }
            
            return res.status(response.status).json({
                error: 'API request failed',
                status: response.status,
                statusText: response.statusText,
                details: errorResponseText || 'No error details available',
                fullResponse: errorResponseText
            });
        }
        
        console.log('=== Success Response ===');
        console.log('Status:', response.status);
        console.log('Response:', responseData);
        
        // Ensure CORS headers are set on response
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.json(responseData);
        
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({
            error: 'Proxy server error',
            message: error.message
        });
    }
});

// Proxy endpoint for Docusign CLM Current User Work Items API
app.get('/api/docusign/current-user-workitems', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
        
        if (!token) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Authorization token is required'
            });
        }
        
        console.log('Proxying current user work items request to Docusign CLM...');
        
        const response = await fetch(
            'https://apiuatna11.springcm.com/v2/75315137-680d-4dd5-b8bf-844d81c18164/members/current/workitems',
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('Current User Work Items API Error:', response.status, responseData);
            return res.status(response.status).json({
                error: 'Current User Work Items API request failed',
                details: responseData
            });
        }
        
        console.log('Current User Work Items Success:', responseData);
        res.json(responseData);
        
    } catch (error) {
        console.error('Current User Work Items Proxy Error:', error);
        res.status(500).json({
            error: 'Current User Work Items proxy server error',
            message: error.message
        });
    }
});

// Proxy endpoint for Docusign CLM Current Member API
app.get('/api/docusign/current-member', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
        const accountId = req.headers['x-account-id'] || req.query.accountId;
        
        if (!token) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Authorization token is required'
            });
        }
        
        if (!accountId) {
            return res.status(400).json({
                error: 'No account ID provided',
                message: 'Account ID is required in headers (x-account-id) or query params (accountId)'
            });
        }
        
        console.log(`Proxying current member request to Docusign CLM for account ${accountId}...`);
        
        const response = await fetch(
            `https://apiuatna11.springcm.com/v2/${accountId}/members/current`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('Current Member API Error:', response.status, responseData);
            return res.status(response.status).json({
                error: 'Current Member API request failed',
                details: responseData
            });
        }
        
        console.log('Current Member Success:', responseData);
        res.json(responseData);
        
    } catch (error) {
        console.error('Current Member Proxy Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Proxy endpoint for Docusign CLM User Workflow Queues API
app.get('/api/docusign/user-workflow-queues', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
        const accountId = req.headers['x-account-id'] || req.query.accountId;
        
        if (!token) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Authorization token is required'
            });
        }
        
        if (!accountId) {
            return res.status(400).json({
                error: 'No account ID provided',
                message: 'Account ID is required in headers (x-account-id) or query params (accountId)'
            });
        }
        
        console.log(`Proxying user workflow queues request to Docusign CLM for account ${accountId}...`);
        
        const response = await fetch(
            `https://apiuatna11.springcm.com/v2/${accountId}/members/current/workflowqueues`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('User Workflow Queues API Error:', response.status, responseData);
            return res.status(response.status).json({
                error: 'User Workflow Queues API request failed',
                details: responseData
            });
        }
        
        console.log('User Workflow Queues Success:', responseData);
        res.json(responseData);
        
    } catch (error) {
        console.error('User Workflow Queues Proxy Error:', error);
        res.status(500).json({
            error: 'User Workflow Queues proxy server error',
            message: error.message
        });
    }
});

// Legacy endpoint for backward compatibility
app.get('/api/docusign/workitems', async (req, res) => {
    // Redirect to the new current user endpoint
    console.log('Legacy workitems endpoint called, redirecting to current-user-workitems...');
    
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
        
        if (!token) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Authorization token is required'
            });
        }
        
        const response = await fetch(
            'https://apiuatna11.springcm.com/v2/75315137-680d-4dd5-b8bf-844d81c18164/members/current/workitems',
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('Legacy Work Items API Error:', response.status, responseData);
            return res.status(response.status).json({
                error: 'Legacy Work Items API request failed',
                details: responseData
            });
        }
        
        console.log('Legacy Work Items Success:', responseData);
        res.json(responseData);
        
    } catch (error) {
        console.error('Legacy Work Items Proxy Error:', error);
        res.status(500).json({
            error: 'Legacy Work Items proxy server error',
            message: error.message
        });
    }
});

// Proxy endpoint for Docusign CLM Workflow Queues API
app.get('/api/docusign/workflow-queues', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
        
        if (!token) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Authorization token is required'
            });
        }
        
        console.log('Proxying workflow queues request to Docusign CLM...');
        
        const response = await fetch(
            'https://apiuatna11.springcm.com/v2/75315137-680d-4dd5-b8bf-844d81c18164/workflowqueues',
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('Workflow Queues API Error:', response.status, responseData);
            return res.status(response.status).json({
                error: 'Workflow Queues API request failed',
                details: responseData
            });
        }
        
        console.log('Workflow Queues Success:', responseData);
        res.json(responseData);
        
    } catch (error) {
        console.error('Workflow Queues Proxy Error:', error);
        res.status(500).json({
            error: 'Workflow Queues proxy server error',
            message: error.message
        });
    }
});

// Proxy endpoint for Docusign CLM Member Details API
app.get('/api/docusign/member/:memberId', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
        const memberId = req.params.memberId;
        const accountId = req.headers['x-account-id'] || req.query.accountId;
        
        if (!token) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Authorization token is required'
            });
        }
        
        if (!memberId) {
            return res.status(400).json({
                error: 'No member ID provided',
                message: 'Member ID is required'
            });
        }
        
        if (!accountId) {
            return res.status(400).json({
                error: 'No account ID provided',
                message: 'Account ID is required in headers (x-account-id) or query params (accountId)'
            });
        }
        
        console.log(`Proxying member details request for member ${memberId} to Docusign CLM for account ${accountId}...`);
        
        const response = await fetch(
            `https://apiuatna11.springcm.com/v2/${accountId}/members/${memberId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('Member Details API Error:', response.status, responseData);
            return res.status(response.status).json({
                error: 'Member Details API request failed',
                details: responseData
            });
        }
        
        console.log('Member Details Success:', responseData);
        res.json(responseData);
        
    } catch (error) {
        console.error('Member Details Proxy Error:', error);
        res.status(500).json({
            error: 'Member Details proxy server error',
            message: error.message
        });
    }
});

// Proxy endpoint for Docusign CLM Workflow Info API
app.get('/api/docusign/workflow/:workflowId', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
        const workflowId = req.params.workflowId;
        
        if (!token) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Authorization token is required'
            });
        }
        
        if (!workflowId) {
            return res.status(400).json({
                error: 'No workflow ID provided',
                message: 'Workflow ID is required'
            });
        }
        
        console.log(`Proxying workflow info request for workflow ${workflowId} to Docusign CLM...`);
        
        const response = await fetch(
            `https://apiuatna11.springcm.com/v2/75315137-680d-4dd5-b8bf-844d81c18164/workflows/${workflowId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('Workflow Info API Error:', response.status, responseData);
            return res.status(response.status).json({
                error: 'Workflow Info API request failed',
                details: responseData
            });
        }
        
        console.log('Workflow Info Success:', responseData);
        res.json(responseData);
        
    } catch (error) {
        console.error('Workflow Info Proxy Error:', error);
        res.status(500).json({
            error: 'Workflow Info proxy server error',
            message: error.message
        });
    }
});

// Proxy endpoint for Docusign CLM Document Attributes API
app.get('/api/docusign/document/:documentId/attributes', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
        const documentId = req.params.documentId;
        
        if (!token) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Authorization token is required'
            });
        }
        
        if (!documentId) {
            return res.status(400).json({
                error: 'No document ID provided',
                message: 'Document ID is required'
            });
        }
        
        console.log(`Proxying document attributes request for document ${documentId} to Docusign CLM...`);
        
        const response = await fetch(
            `https://apiuatna11.springcm.com/v2/75315137-680d-4dd5-b8bf-844d81c18164/documents/${documentId}?expand=AttributeGroups`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('Document Attributes API Error:', response.status, responseData);
            return res.status(response.status).json({
                error: 'Document Attributes API request failed',
                details: responseData
            });
        }
        
        console.log('Document Attributes Success:', responseData);
        res.json(responseData);
        
    } catch (error) {
        console.error('Document Attributes Proxy Error:', error);
        res.status(500).json({
            error: 'Document Attributes proxy server error',
            message: error.message
        });
    }
});

// Proxy endpoint for Docusign CLM Queue Work Items API
app.get('/api/docusign/queue-workitems/:queueId', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
        const queueId = req.params.queueId;
        const accountId = req.headers['x-account-id'] || req.query.accountId;
        
        if (!token) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Authorization token is required'
            });
        }
        
        if (!queueId) {
            return res.status(400).json({
                error: 'No queue ID provided',
                message: 'Queue ID is required'
            });
        }
        
        if (!accountId) {
            return res.status(400).json({
                error: 'No account ID provided',
                message: 'Account ID is required in headers (x-account-id) or query params (accountId)'
            });
        }
        
        console.log(`Proxying queue work items request for queue ${queueId} to Docusign CLM for account ${accountId}...`);
        
        const response = await fetch(
            `https://apiuatna11.springcm.com/v2/${accountId}/workflowqueues/${queueId}/workitems`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('Queue Work Items API Error:', response.status, responseData);
            return res.status(response.status).json({
                error: 'Queue Work Items API request failed',
                details: responseData
            });
        }
        
        console.log('Queue Work Items Success:', responseData);
        res.json(responseData);
        
    } catch (error) {
        console.error('Queue Work Items Proxy Error:', error);
        res.status(500).json({
            error: 'Queue Work Items proxy server error',
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Proxy server running at http://localhost:${PORT}`);
    console.log(`📱 Open your app at: http://localhost:${PORT}/index.html`);
}); 