// Configuration - Docusign CLM API details
const CONFIG = {
    // Docusign CLM base URL and account ID
    CLM_BASE_URL: 'https://apiuatna11.springcm.com/v2/75315137-680d-4dd5-b8bf-844d81c18164',
    // Workflows endpoint
    WORKFLOW_ENDPOINT: '/workflows',
    // Token storage key
    TOKEN_KEY: 'docusign_clm_token'
};

// Product catalog with realistic Vodafone offerings
const PRODUCTS = {
    mobile: [
        { id: 'mob_essential_5gb', name: 'Essential 5GB', description: '5GB data, unlimited calls & texts', price: 15.00 },
        { id: 'mob_unlimited_max', name: 'Unlimited Max', description: 'Unlimited data, calls & texts + 5G', price: 35.00 },
        { id: 'mob_red_plus', name: 'Red Plus 50GB', description: '50GB data + international roaming', price: 25.00 },
        { id: 'mob_business_sim', name: 'Business SIM Only', description: 'Unlimited business data + priority support', price: 45.00 }
    ],
    broadband: [
        { id: 'bb_superfast_35', name: 'Superfast 1 (35Mbps)', description: 'Average 35Mbps download speed', price: 28.00 },
        { id: 'bb_superfast_67', name: 'Superfast 2 (67Mbps)', description: 'Average 67Mbps download speed', price: 35.00 },
        { id: 'bb_ultrafast_100', name: 'Ultrafast 100', description: 'Average 100Mbps download speed', price: 45.00 },
        { id: 'bb_gigafast_900', name: 'Gigafast 900', description: 'Average 900Mbps download speed', price: 65.00 }
    ],
    business: [
        { id: 'biz_connectivity', name: 'Business Connectivity', description: 'Dedicated business internet + support', price: 120.00 },
        { id: 'biz_mobile_fleet', name: 'Mobile Fleet Management', description: 'Fleet tracking & management solution', price: 25.00 },
        { id: 'biz_cloud_services', name: 'Cloud Services Package', description: 'Cloud hosting + security + backup', price: 85.00 },
        { id: 'biz_unified_comms', name: 'Unified Communications', description: 'VoIP + video conferencing + collaboration', price: 40.00 }
    ],
    iot: [
        { id: 'iot_asset_tracking', name: 'Asset Tracking Solution', description: 'GPS tracking for vehicles & equipment', price: 15.00 },
        { id: 'iot_smart_agriculture', name: 'Smart Agriculture Package', description: 'Soil monitoring + weather sensors', price: 75.00 },
        { id: 'iot_fleet_telemetry', name: 'Fleet Telemetry', description: 'Vehicle diagnostics + driver behavior', price: 35.00 },
        { id: 'iot_smart_meters', name: 'Smart Metering Solution', description: 'Remote utility meter reading', price: 12.00 }
    ]
};

// DOM Elements
const elements = {
    apiToken: document.getElementById('apiToken'),
    tokenStatus: document.getElementById('tokenStatus'),
    tokenSection: document.querySelector('.token-section'),
    signupForm: document.getElementById('signupForm'),
    submissionStatus: document.getElementById('submissionStatus'),
    submitBtn: document.querySelector('.submit-btn'),
    productCategory: document.getElementById('productCategory'),
    selectedProduct: document.getElementById('selectedProduct'),
    quantity: document.getElementById('quantity'),
    productGroup: document.getElementById('productGroup'),
    quantityGroup: document.getElementById('quantityGroup'),
    orderSummary: document.getElementById('orderSummary'),
    selectedProductName: document.getElementById('selectedProductName'),
    selectedProductPrice: document.getElementById('selectedProductPrice'),
    summaryQuantity: document.getElementById('summaryQuantity'),
    totalPrice: document.getElementById('totalPrice')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkTokenStatus();
    setupFormHandlers();
});

// Token Management Functions
function saveToken() {
    const token = elements.apiToken.value.trim();
    
    if (!token) {
        showTokenStatus('Please enter a token', 'error');
        return;
    }
    
    try {
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
        elements.apiToken.value = '';
        showTokenStatus('Token saved successfully!', 'success');
        
        // Hide the token section after successful save with smooth animation
        setTimeout(() => {
            elements.tokenSection.style.opacity = '0';
            elements.tokenSection.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                elements.tokenSection.style.display = 'none';
            }, 300); // Wait for animation to complete
        }, 1500); // Wait 1.5 seconds to let user see the success message
        
    } catch (error) {
        showTokenStatus('Failed to save token: ' + error.message, 'error');
    }
}

function clearToken() {
    try {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        showTokenStatus('Token cleared successfully!', 'info');
        // Show the token section again so user can enter a new token
        elements.tokenSection.style.display = 'block';
        elements.tokenSection.style.opacity = '1';
        elements.tokenSection.style.transform = 'translateY(0)';
    } catch (error) {
        showTokenStatus('Failed to clear token: ' + error.message, 'error');
    }
}

function getStoredToken() {
    return localStorage.getItem(CONFIG.TOKEN_KEY);
}

function checkTokenStatus() {
    const token = getStoredToken();
    if (token) {
        showTokenStatus('Token is configured ✓', 'success');
        // Hide the token section if token is already configured
        elements.tokenSection.style.display = 'none';
    } else {
        showTokenStatus('No token configured', 'info');
        // Ensure the token section is visible if no token
        elements.tokenSection.style.display = 'block';
        elements.tokenSection.style.opacity = '1';
        elements.tokenSection.style.transform = 'translateY(0)';
    }
}

function showTokenStatus(message, type) {
    elements.tokenStatus.textContent = message;
    elements.tokenStatus.className = `status ${type}`;
}

// Product Selection Functions
function updateProductOptions() {
    const category = elements.productCategory.value;
    
    // Clear existing options
    elements.selectedProduct.innerHTML = '<option value="">Select a product</option>';
    
    if (category && PRODUCTS[category]) {
        // Show product selection
        elements.productGroup.style.display = 'block';
        
        // Populate products for selected category
        PRODUCTS[category].forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} - £${product.price.toFixed(2)}/month`;
            option.setAttribute('data-price', product.price);
            option.setAttribute('data-name', product.name);
            option.setAttribute('data-description', product.description);
            elements.selectedProduct.appendChild(option);
        });
    } else {
        // Hide product selection and reset
        elements.productGroup.style.display = 'none';
        elements.quantityGroup.style.display = 'none';
        elements.orderSummary.style.display = 'none';
    }
}

function updatePricing() {
    const selectedOption = elements.selectedProduct.selectedOptions[0];
    const quantity = elements.quantity ? (parseInt(elements.quantity.value) || 1) : 1;
    
    if (selectedOption && selectedOption.value) {
        const productName = selectedOption.getAttribute('data-name');
        const productPrice = parseFloat(selectedOption.getAttribute('data-price'));
        const description = selectedOption.getAttribute('data-description');
        
        // Show quantity group if it exists, otherwise just show order summary
        if (elements.quantityGroup) {
            elements.quantityGroup.style.display = 'block';
        }
        elements.orderSummary.style.display = 'block';
        
        // Update order summary
        elements.selectedProductName.textContent = `${productName}`;
        elements.selectedProductPrice.textContent = `£${productPrice.toFixed(2)}/month`;
        if (elements.summaryQuantity) {
            elements.summaryQuantity.textContent = quantity;
        }
        
        const total = productPrice * quantity;
        elements.totalPrice.textContent = `£${total.toFixed(2)}/month`;
        
        // Update quantity input if it exists
        if (elements.quantity) {
            elements.quantity.setAttribute('required', 'required');
        }
    } else {
        // Hide quantity and order summary
        if (elements.quantityGroup) {
            elements.quantityGroup.style.display = 'none';
        }
        elements.orderSummary.style.display = 'none';
        if (elements.quantity) {
            elements.quantity.removeAttribute('required');
        }
    }
}

// Make functions globally available for HTML onclick handlers
window.updateProductOptions = updateProductOptions;
window.updatePricing = updatePricing;

// Form Handling Functions
function setupFormHandlers() {
    elements.signupForm.addEventListener('submit', handleFormSubmission);
}

async function handleFormSubmission(event) {
    event.preventDefault();
    
    console.log('🛍️ eCommerce form submission started');
    
    // Check if token is available
    const token = getStoredToken();
    if (!token) {
        console.log('❌ No token found');
        showSubmissionStatus('Please configure your API token first', 'error');
        return;
    }
    console.log('✅ Token found:', token ? 'Present' : 'Missing');
    
    // Get form data
    const formData = getFormData();
    console.log('📋 Form data:', formData);
    
    // Validate required fields
    if (!validateFormData(formData)) {
        console.log('❌ Form validation failed');
        return;
    }
    console.log('✅ Form validation passed');
    
    // Show loading state
    setSubmitButtonState(true);
    showSubmissionStatus('Processing your purchase...', 'loading');
    
    try {
        console.log('🚀 Calling submitToDocusignCLM...');
        // Submit to Docusign CLM
        const response = await submitToDocusignCLM(formData, token);
        console.log('📤 API Response:', response);
        
        if (response.success) {
            console.log('🎉 SUCCESS! Showing success message...');
            // Store the workflow submission for tracking
            if (response.workflowId) {
                const workflowStorage = window.VodafoneSignup;
                if (workflowStorage && workflowStorage.storeWorkflowSubmission) {
                    workflowStorage.storeWorkflowSubmission(response.workflowId, formData);
                }
            }
            
            // Create enhanced success display for eCommerce
            const statusEl = elements.submissionStatus;
            const selectedProductName = elements.selectedProduct ? 
                (elements.selectedProduct.selectedOptions[0]?.getAttribute('data-name') || 'Selected Product') : 'N/A';
            
            statusEl.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h3 style="color: #27ae60; margin: 0 0 10px 0;">🎉 Purchase Workflow Successfully Launched!</h3>
                    <p style="margin: 0 0 15px 0; font-size: 16px;">Your Vodafone purchase is now being processed in Docusign CLM.</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <strong>📋 Order Details:</strong><br>
                        <span style="font-family: monospace; color: #666;">Reference ID: ${response.workflowId || 'N/A'}</span><br>
                        <span style="color: #666; font-size: 14px;">Customer: ${formData.fullName}</span><br>
                        <span style="color: #666; font-size: 14px;">Product: ${selectedProductName}</span><br>
                        <span style="color: #666; font-size: 14px;">Plan Type: ${formData.planType}</span><br>
                        <span style="color: #666; font-size: 14px;">Category: ${formData.productCategory}</span>
                    </div>
                    <div style="margin-top: 15px;">
                        <small style="color: #666;">📧 You will receive email updates on your order progress</small>
                    </div>
                </div>
            `;
            statusEl.className = 'status-display success show';
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                statusEl.classList.remove('show');
            }, 5000);
            
            // Show the document info section for successful submissions
            const documentInfoSection = document.getElementById('documentInfoSection');
            if (documentInfoSection && response.workflowId) {
                documentInfoSection.style.display = 'block';
            }
            
            if (elements.signupForm) {
                elements.signupForm.reset();
                // Reset the UI
                if (elements.productGroup) elements.productGroup.style.display = 'none';
                if (elements.quantityGroup) elements.quantityGroup.style.display = 'none';
                if (elements.orderSummary) elements.orderSummary.style.display = 'none';
            }
        } else {
            console.log('❌ API call failed, throwing error...');
            throw new Error(response.error || 'Purchase failed');
        }
        
    } catch (error) {
        console.error('💥 Purchase error:', error);
        console.error('💥 Error details:', error.message);
        
        // Enhanced error display
        let errorMessage = `Purchase failed: ${error.message}`;
        
        // Check for specific error types
        if (error.message.includes('401') || error.message.includes('Authentication failed')) {
            errorMessage = `❌ Authentication Error: Your API token is invalid or expired. Please check your token in the <a href="admin.html">Admin panel</a>.`;
        } else if (error.message.includes('CORS')) {
            errorMessage = `❌ Network Error: CORS issue detected. Try using the proxy server or configure CORS.`;
        }
        
        showSubmissionStatus(errorMessage, 'error');
    } finally {
        setSubmitButtonState(false);
        console.log('🔄 Form submission complete, button re-enabled');
    }
}

function getFormData() {
    const formData = new FormData(elements.signupForm);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

function validateFormData(data) {
    const missingFields = [];
    
    // Find all required fields in the current form
    const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredInputs.forEach(input => {
        const fieldName = input.name;
        if (!data[fieldName] || data[fieldName].trim() === '') {
            missingFields.push(fieldName);
        }
    });
    
    // Check if quantity is provided when product is selected (only if quantity field exists)
    if (data.selectedProduct && elements.quantity && (!data.quantity || parseInt(data.quantity) < 1)) {
        missingFields.push('quantity');
    }
    
    if (missingFields.length > 0) {
        showSubmissionStatus(
            `Please fill in all required fields: ${missingFields.join(', ')}`, 
            'error'
        );
        return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showSubmissionStatus('Please enter a valid email address', 'error');
        return false;
    }
    
    return true;
}

// Helper function to create XML params for Docusign CLM
function createXMLParams(formData) {
    // Escape XML special characters
    function escapeXML(str) {
        if (!str) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    
    // Get product details
    const selectedOption = elements.selectedProduct.selectedOptions[0];
    let productDetails = {};
    if (selectedOption && selectedOption.value) {
        productDetails = {
            productId: selectedOption.value,
            productName: selectedOption.getAttribute('data-name'),
            productDescription: selectedOption.getAttribute('data-description'),
            unitPrice: parseFloat(selectedOption.getAttribute('data-price')),
            quantity: formData.quantity ? parseInt(formData.quantity) : 1
        };
        productDetails.totalPrice = productDetails.unitPrice * productDetails.quantity;
    }
    
    // Create XML structure with form data (flexible for different form types)
    let xmlParams = `<params>`;
    
    // Add customer information (handle both old and new field names)
    if (formData.fullName) {
        xmlParams += `<fullName>${escapeXML(formData.fullName)}</fullName>`;
    }
    if (formData.companyName) {
        xmlParams += `<companyName>${escapeXML(formData.companyName)}</companyName>`;
    }
    if (formData.contactName) {
        xmlParams += `<contactName>${escapeXML(formData.contactName)}</contactName>`;
    }
    
    xmlParams += `<email>${escapeXML(formData.email)}</email>
        <phone>${escapeXML(formData.phone)}</phone>`;
        
    // Add address if present (new ecommerce form)
    if (formData.address) {
        xmlParams += `<address>${escapeXML(formData.address)}</address>`;
    }
    
    // Add plan type if present (for workflow routing)
    if (formData.planType) {
        xmlParams += `<planType>${escapeXML(formData.planType)}</planType>`;
    }
    
    xmlParams += `<productCategory>${escapeXML(formData.productCategory)}</productCategory>
        <productId>${escapeXML(productDetails.productId || '')}</productId>
        <productName>${escapeXML(productDetails.productName || '')}</productName>
        <productDescription>${escapeXML(productDetails.productDescription || '')}</productDescription>
        <unitPrice>${productDetails.unitPrice || 0}</unitPrice>
        <quantity>${productDetails.quantity || 1}</quantity>
        <totalMonthlyPrice>${productDetails.totalPrice || 0}</totalMonthlyPrice>`;
        
    // Add business size if present (old form)
    if (formData.businessSize) {
        xmlParams += `<businessSize>${escapeXML(formData.businessSize)}</businessSize>`;
    }
    
    xmlParams += `<requirements>${escapeXML(formData.requirements || '')}</requirements>
        <source>Vodafone Product Signup Portal</source>
        <timestamp>${new Date().toISOString()}</timestamp>
    </params>`;
    
    return xmlParams;
}

// Agent-specific XML creation function
function createAgentXMLParams(formData) {
    function escapeXML(str) {
        if (!str) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    // Convert boolean values to the format expected by Docusign CLM
    function getBooleanKey(value) {
        console.log('getBooleanKey received value:', value, 'type:', typeof value);
        
        // Handle checkbox boolean values
        if (value === true || value === 'true' || value === 'on') {
            return 'Yes';
        } else if (value === false || value === 'false' || value === '' || value === null || value === undefined) {
            return 'No';
        }
        // Handle radio button string values: 'YES' or 'NO'
        else if (value === 'YES' || value === 'yes') {
            return 'Yes';
        } else if (value === 'NO' || value === 'no') {
            return 'No';
        }
        // Default fallback for any other values
        console.log('getBooleanKey: Unknown value, defaulting to No');
        return 'No';
    }

    const xmlParams = `<TemplateFieldData>
        <Addendum_Number>${escapeXML(formData.addendumNo || '')}</Addendum_Number>
        <Serie_Number_Contract>${escapeXML(formData.serieNumberContract || '')}</Serie_Number_Contract>
        <Vodafone_Registration_Data>${escapeXML(formData.vodafoneRegistrationData || '')}</Vodafone_Registration_Data>
        <Agent_Name>${escapeXML(formData.agentName)}</Agent_Name>
        <Agent_Role>${escapeXML(formData.agentRole)}</Agent_Role>
        <Agent_Telephone_Number>${escapeXML(formData.agentTelephone)}</Agent_Telephone_Number>
        <Client_Registration_Data>${escapeXML(formData.clientRegistrationData)}</Client_Registration_Data>
        <Sales_Segment>${escapeXML(formData.salesSegment)}</Sales_Segment>
        <Invoice_should_be_issued_on_the_1st_of_each_month>${getBooleanKey(formData.invoiceFirstMonth)}</Invoice_should_be_issued_on_the_1st_of_each_month>
        <Electronic_invoice>${getBooleanKey(formData.electronicInvoice)}</Electronic_invoice>
        <SMS_or_RCS_or_USSD_Notification>${getBooleanKey(formData.smsNotification)}</SMS_or_RCS_or_USSD_Notification>
        <Emails>${getBooleanKey(formData.emailNotification)}</Emails>
        <Automatic_Phone_Calls>${getBooleanKey(formData.automaticPhoneCalls)}</Automatic_Phone_Calls>
        <Contract_Duration>${escapeXML(formData.contractDuration)}</Contract_Duration>
        <Contract_Routing>${escapeXML(formData.contractRouting)}</Contract_Routing>
        <Chosen_Service>${escapeXML(formData.chosenService)}</Chosen_Service>
    </TemplateFieldData>`;

    return xmlParams;
}

// Docusign CLM API Integration
async function submitToDocusignCLM(formData, token) {
    // Check if we're using dynamic configuration
    const config = getWorkflowConfiguration();
    let xmlData, workflowName;
    
    if (isDynamicModeEnabled()) {
        // Use dynamic configuration
        xmlData = createDynamicXMLParams(formData, config.fields);
        workflowName = config.workflowName;
    } else {
        // Use legacy hardcoded configuration
        xmlData = (formData.agentName && formData.agentRole) ? 
            createAgentXMLParams(formData) : createXMLParams(formData);
        workflowName = typeof getWorkflowName === 'function' ? 
            getWorkflowName() : 'Vodafone Product Signup Workflow';
    }
    
    // Prepare the payload for Docusign CLM - exactly as specified
    const payload = {
        "Name": workflowName,
        "Params": xmlData
    };
    
    // Check if we're running through the proxy server
    const isUsingProxy = window.location.hostname === 'localhost' && window.location.port === '3000';
    
    let requestOptions, apiUrl;
    
    if (isUsingProxy) {
        // Use proxy server (no CORS issues)
        console.log('🔄 Using proxy server (CORS-safe)');
        apiUrl = '/api/docusign/workflows';
        requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, payload })
        };
    } else {
        // Direct API call (requires CORS-disabled browser or CORS support)
        console.log('🌐 Direct API call (requires CORS-disabled browser)');
        apiUrl = `${CONFIG.CLM_BASE_URL}${CONFIG.WORKFLOW_ENDPOINT}`;
        requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': '*/*',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(payload)
        };
    }
    
    try {
        // Always log basic debug info for 401 troubleshooting
        console.log('=== API Request Debug ===');
        console.log('URL:', apiUrl);
        console.log('Using Proxy:', isUsingProxy);
        console.log('Method:', requestOptions.method);
        console.log('Headers:', requestOptions.headers);
        console.log('Token length:', token ? token.length : 'No token');
        console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
        
        // Decode JWT token to check expiration and issuer
        if (token && token.includes('.')) {
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    console.log('JWT Payload:', payload);
                    
                    if (payload.exp) {
                        const expDate = new Date(payload.exp * 1000);
                        const now = new Date();
                        console.log('Token expires:', expDate.toISOString());
                        console.log('Current time:', now.toISOString());
                        console.log('Token expired?', expDate < now);
                        
                        if (expDate < now) {
                            console.error('🚨 TOKEN IS EXPIRED! Please get a new token.');
                        }
                    }
                    
                    if (payload.iss) {
                        console.log('Token issuer:', payload.iss);
                                if (payload.iss.includes('docusign.com')) {
            console.warn('⚠️  This appears to be a Docusign token, but you\'re calling SpringCM API. Make sure this is correct.');
        }
                    }
                }
            } catch (e) {
                console.log('Could not decode JWT token:', e.message);
            }
        }
        
        console.log('Payload:', requestOptions.body);
        console.log('========================');

        const response = await fetch(apiUrl, requestOptions);
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Check for CORS issue
        if (response.status === 0 || response.type === 'opaque') {
            console.error('🚨 CORS ERROR: Browser blocked the request. This API needs to allow cross-origin requests.');
            throw new Error('CORS error: This API must be called from a server, not directly from a web browser due to CORS restrictions.');
        }
        
        // If 401 and NOT using proxy, try alternative auth formats
        if (response.status === 401 && !isUsingProxy) {
            console.log('401 detected - trying alternative auth formats...');
            
            // Try without "Bearer " prefix
            const altRequestOptions = {
                ...requestOptions,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token  // Just the token, no "Bearer "
                }
            };
            
            console.log('Trying Authorization without Bearer prefix...');
            const altResponse = await fetch(apiUrl, altRequestOptions);
            
            console.log('Alt response status:', altResponse.status);
            
            if (altResponse.status !== 401) {
                // This worked, use this response
                const responseData = await altResponse.json();
                return {
                    success: true,
                    workflowId: responseData.Id || responseData.id || responseData.workflowId,
                    data: responseData
                };
            }
            
            // If that didn't work, try X-API-Key
            const apiKeyRequestOptions = {
                ...requestOptions,
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': token
                }
            };
            
            console.log('Trying X-API-Key header...');
            const apiKeyResponse = await fetch(apiUrl, apiKeyRequestOptions);
            
            console.log('X-API-Key response status:', apiKeyResponse.status);
            
            if (apiKeyResponse.status !== 401) {
                // This worked, use this response
                const responseData = await apiKeyResponse.json();
                return {
                    success: true,
                    workflowId: responseData.Id || responseData.id || responseData.workflowId,
                    data: responseData
                };
            }
        }
        
        if (!response.ok) {
            // Try to get error message from response
            let errorMessage = `HTTP ${response.status}`;
            let responseText = '';
            
            try {
                responseText = await response.text();
                if (debugMode) {
                    console.log('Error response body:', responseText);
                }
                
                // Try to parse as JSON
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorData.error || errorData.errorMessage || errorMessage;
            } catch (e) {
                // If response is not JSON, use the raw text or status
                if (responseText) {
                    errorMessage = responseText.length > 200 ? 
                        responseText.substring(0, 200) + '...' : responseText;
                } else {
                    errorMessage = response.statusText || errorMessage;
                }
            }
            
            // Special handling for 401 errors
            if (response.status === 401) {
                errorMessage = `Authentication failed (401). Please check your API token. ${errorMessage}`;
            }
            
            throw new Error(errorMessage);
        }
        
        const responseData = await response.json();
        
        return {
            success: true,
            workflowId: responseData.Id || responseData.id || responseData.workflowId || 
                       (responseData.Href ? responseData.Href.split('/').pop() : null),
            data: responseData
        };
        
    } catch (error) {
        console.error('Docusign CLM API Error:', error);
        
        // Handle specific error types
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('CORS/Network error: The browser blocked this request. The API needs to allow cross-origin requests or you need to call it from a server instead of directly from the browser.');
        }
        
        // Check for common CORS error patterns
        if (error.message.includes('CORS') || 
            error.message.includes('Cross-Origin') ||
            error.message.includes('blocked') ||
            (error.name === 'TypeError' && error.message.includes('Failed to fetch'))) {
            throw new Error('CORS error: This API cannot be called directly from a web browser. You need either: 1) The API to enable CORS, or 2) Call it through a backend server.');
        }
        
        throw error;
    }
}

// UI Helper Functions
function setSubmitButtonState(isLoading) {
    elements.submitBtn.disabled = isLoading;
    
    if (isLoading) {
        elements.submitBtn.classList.add('loading');
        elements.submitBtn.textContent = 'Processing Purchase...';
    } else {
        elements.submitBtn.classList.remove('loading');
        elements.submitBtn.textContent = 'Complete Purchase';
    }
}

function showSubmissionStatus(message, type) {
    elements.submissionStatus.textContent = message;
    elements.submissionStatus.className = `status-display ${type} show`;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            elements.submissionStatus.classList.remove('show');
        }, 5000);
    }
}

// Utility Functions
function debugApiCall(payload, token) {
    console.log('=== DEBUG: API Call Details ===');
    console.log('Endpoint:', `${CONFIG.CLM_BASE_URL}${CONFIG.WORKFLOW_ENDPOINT}`);
    console.log('Token:', token ? 'Present (hidden for security)' : 'Missing');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('===============================');
}

// Workflow Configuration Functions
function getWorkflowConfigs() {
    try {
        return JSON.parse(localStorage.getItem('workflow_configs') || '{}');
    } catch {
        return {};
    }
}

function setWorkflowConfig(workflowType, workflowName) {
    const workflows = getWorkflowConfigs();
    workflows[workflowType] = workflowName;
    localStorage.setItem('workflow_configs', JSON.stringify(workflows));
}

// Dynamic Configuration Functions
function getWorkflowConfiguration() {
    try {
        return JSON.parse(localStorage.getItem('workflow_configuration') || '{}');
    } catch {
        return {};
    }
}

function isDynamicModeEnabled() {
    const config = getWorkflowConfiguration();
    return config && config.workflowName && config.fields && config.fields.length > 0;
}

function generateDynamicForm(containerId, fields) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }
    
    let formHtml = '';
    
    fields.forEach(field => {
        formHtml += `<div class="form-group">`;
        formHtml += `<label for="${field.name}">${field.label}${field.required ? ' *' : ''}:</label>`;
        
        // Escape HTML for default value to prevent XSS
        const defaultValue = field.sampleValue ? field.sampleValue.replace(/[&<>"']/g, function(match) {
            const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
            return escapeMap[match];
        }) : '';
        
        switch (field.type) {
            case 'textarea':
                formHtml += `<textarea id="${field.name}" name="${field.name}" placeholder="${defaultValue}"${field.required ? ' required' : ''}>${defaultValue}</textarea>`;
                break;
            case 'select':
                formHtml += `<select id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}>`;
                formHtml += `<option value="">Select...</option>`;
                if (field.options) {
                    field.options.forEach(option => {
                        const selected = option === defaultValue ? ' selected' : '';
                        formHtml += `<option value="${option}"${selected}>${option}</option>`;
                    });
                }
                formHtml += `</select>`;
                break;
            case 'email':
                formHtml += `<input type="email" id="${field.name}" name="${field.name}" placeholder="${defaultValue}" value="${defaultValue}"${field.required ? ' required' : ''}>`;
                break;
            case 'number':
                formHtml += `<input type="number" id="${field.name}" name="${field.name}" placeholder="${defaultValue}" value="${defaultValue}"${field.required ? ' required' : ''}>`;
                break;
            case 'tel':
                formHtml += `<input type="tel" id="${field.name}" name="${field.name}" placeholder="${defaultValue}" value="${defaultValue}"${field.required ? ' required' : ''}>`;
                break;
            default:
                formHtml += `<input type="text" id="${field.name}" name="${field.name}" placeholder="${defaultValue}" value="${defaultValue}"${field.required ? ' required' : ''}>`;
        }
        
        formHtml += `</div>`;
    });
    
    container.innerHTML = formHtml;
}

function createDynamicXMLParams(formData, fields) {
    function escapeXML(str) {
        if (!str) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    
    // Get the configuration to determine the root element
    const config = getWorkflowConfiguration();
    const rootElement = extractRootElementFromXML(config.exampleParams) || 'TemplateFieldData';
    
    let xmlParams = `<${rootElement}>`;
    
    fields.forEach(field => {
        const value = formData[field.name] || '';
        xmlParams += `<${field.name}>${escapeXML(value)}</${field.name}>`;
    });
    
    xmlParams += `</${rootElement}>`;
    
    return xmlParams;
}

function extractRootElementFromXML(xmlString) {
    if (!xmlString) return null;
    
    const match = xmlString.match(/<(\w+)>/);
    return match ? match[1] : null;
}

function parseXMLToFields(xmlString) {
    const fields = [];
    
    // Simple XML parsing - extract tags and their content
    const tagRegex = /<(\w+)>([^<]*)<\/\1>/g;
    let match;
    
    while ((match = tagRegex.exec(xmlString)) !== null) {
        const [, tagName, sampleValue] = match;
        
        // Skip root elements and common wrapper tags
        if (['TemplateFieldData', 'params', 'root'].includes(tagName)) {
            continue;
        }
        
        // Convert tag names to human-readable labels
        const label = tagName
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .replace(/\b\w/g, l => l.toUpperCase());
        
        // Determine field type based on sample value
        let fieldType = 'text';
        let options = null;
        
        if (sampleValue.toLowerCase() === 'yes' || sampleValue.toLowerCase() === 'no') {
            fieldType = 'select';
            options = ['Yes', 'No'];
        } else if (sampleValue.includes('@')) {
            fieldType = 'email';
        } else if (/^\d+$/.test(sampleValue)) {
            fieldType = 'number';
        } else if (/^\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/.test(sampleValue)) {
            fieldType = 'tel';
        } else if (sampleValue.length > 50) {
            fieldType = 'textarea';
        }
        
        fields.push({
            name: tagName,
            label: label,
            type: fieldType,
            sampleValue: sampleValue,
            options: options,
            required: true // Default to required
        });
    }
    
    return fields;
}

// Workflow storage functions
function storeWorkflowSubmission(workflowId, submissionData) {
    try {
        const submissions = JSON.parse(localStorage.getItem('workflow_submissions') || '[]');
        const submission = {
            id: workflowId,
            submittedAt: new Date().toISOString(),
            contractRouting: submissionData.contractRouting || 'unknown',
            agentName: submissionData.agentName || 'Unknown',
            clientName: submissionData.clientRegistrationData ? 
                submissionData.clientRegistrationData.split('\n')[0] : 'Unknown Client',
            salesSegment: submissionData.salesSegment || 'Unknown',
            status: 'submitted'
        };
        
        submissions.push(submission);
        localStorage.setItem('workflow_submissions', JSON.stringify(submissions));
        
        console.log('Stored workflow submission:', submission);
        return submission;
    } catch (error) {
        console.error('Error storing workflow submission:', error);
        return null;
    }
}

function getWorkflowSubmissions() {
    try {
        return JSON.parse(localStorage.getItem('workflow_submissions') || '[]');
    } catch (error) {
        console.error('Error getting workflow submissions:', error);
        return [];
    }
}

function getWorkflowSubmission(workflowId) {
    const submissions = getWorkflowSubmissions();
    return submissions.find(s => s.id === workflowId);
}

function updateWorkflowSubmissionStatus(workflowId, status) {
    try {
        const submissions = getWorkflowSubmissions();
        const submission = submissions.find(s => s.id === workflowId);
        if (submission) {
            submission.status = status;
            submission.updatedAt = new Date().toISOString();
            localStorage.setItem('workflow_submissions', JSON.stringify(submissions));
            return submission;
        }
        return null;
    } catch (error) {
        console.error('Error updating workflow submission status:', error);
        return null;
    }
}

// Export functions for potential testing
window.VodafoneSignup = {
    saveToken,
    clearToken,
    getStoredToken,
    getWorkflowConfigs,
    setWorkflowConfig,
    submitToDocusignCLM,
    storeWorkflowSubmission,
    getWorkflowSubmissions,
    getWorkflowSubmission,
    updateWorkflowSubmissionStatus,
    CONFIG
}; 