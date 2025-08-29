# Docusign CLM Portal

A dynamic, configurable portal for submitting workflows to Docusign CLM with custom form generation.

## 🚀 Quick Start

1. **Start the server**: `npm start`
2. **Choose authentication**: Visit `/admin.html` and either:
   - **Click "Login with Docusign OAuth"** (recommended)
   - **Click "Advanced: Use Token"** (power users)
3. **Select your account** from the discovered list
4. **Configure workflow**: Visit `/config.html` 
5. **Submit workflows**: Visit `/dynamic-form.html`

> **New!** 🎉 Dual authentication options - OAuth or direct token entry!

## 📋 Core Features

### **🚀 Kick Off Workflow** (`/dynamic-form.html`)
- Submit workflows using dynamically generated forms
- Forms automatically created from your XML structure
- Live XML preview before submission
- Smart field type detection

### **🔧 Configuration** (`/config.html`)
- Configure workflow name and XML structure
- Automatic form field generation from XML
- Preview generated forms
- Test configuration before use

### **📋 Tasks** (`/tasks.html`)
- View workflow tasks requiring approval
- Queue-based task management
- Filter and search functionality

### **🔐 Login & Setup** (`/admin.html`)
- OAuth authentication with Docusign
- Automatic account selection
- Secure token management
- System configuration

## 🛠️ How It Works

### **1. Authentication Process**
1. **Login with Docusign**: Click "Login with Docusign" button
2. **Select Account**: Choose from available Docusign accounts
3. **Define Workflow**: Set workflow name in Configuration
4. **Provide XML Structure**: Paste example XML parameters
5. **Generate Form**: System creates form fields automatically

### **2. Dynamic Form Generation**
The system parses your XML structure and creates appropriate form fields:

```xml
<TemplateFieldData>
    <Customer_Name>John Doe</Customer_Name>           <!-- Text input -->
    <Email_Address>john@example.com</Email_Address>   <!-- Email input -->
    <Phone_Number>555-1234</Phone_Number>             <!-- Phone input -->
    <Service_Type>Premium</Service_Type>              <!-- Text input -->
    <Electronic_Invoice>Yes</Electronic_Invoice>      <!-- Yes/No dropdown -->
</TemplateFieldData>
```

### **3. Workflow Submission**
- Form data collected automatically
- XML generated dynamically using your structure
- Submitted to your specified Docusign CLM workflow

## 📚 Usage Guide

### **Initial Setup**
1. Visit `http://localhost:3000/admin.html`
2. Click "Connect Docusign Account" button
3. Enter your Docusign token (from Postman, CLI, etc.)
4. Click "Discover My Accounts" to find your accounts
5. Select your account from the dropdown
6. You're ready to use the portal!

> **Note**: No setup required! Just get a token from Postman, CLI, or Developer Console. See [OAUTH-SETUP-GUIDE.md](OAUTH-SETUP-GUIDE.md) for detailed instructions.

### **Workflow Configuration**
1. Visit `http://localhost:3000/config.html`
2. Enter your workflow name (exact match required)
3. Paste your XML structure with sample values
4. Save configuration

### **Submitting Workflows**
1. Visit `http://localhost:3000/dynamic-form.html`
2. Fill out the dynamically generated form
3. Preview XML (optional)
4. Submit workflow

## 🔐 Dual Authentication Options

The portal now supports **two authentication methods** to give users flexibility:

### **🚀 OAuth Login (Recommended)**
- **One-click OAuth** - using generic client ID pattern
- **Account selection** - choose from discovered accounts
- **Professional flow** - industry-standard OAuth experience

### **🔧 Advanced: Token Entry**  
- **Direct token entry** - paste token from Postman/CLI
- **Immediate access** - works with any valid token
- **Power user option** - for developers and integrators

### **Flexible & Reliable! 🎉**
Choose OAuth for simplicity or token entry for direct control. Both methods support automatic account discovery!

📖 **See [OAUTH-SETUP-GUIDE.md](OAUTH-SETUP-GUIDE.md) for how it works**

## 🔧 Technical Details

### **Field Type Detection**
- **Email**: Contains `@` symbol → Email input
- **Phone**: Matches phone pattern → Phone input  
- **Number**: Numeric values → Number input
- **Yes/No**: `Yes`/`No` values → Dropdown select
- **Long text**: >50 characters → Textarea
- **Default**: Text input

### **Storage**
- **OAuth Token**: `localStorage.docusign_clm_token`
- **Account ID**: `localStorage.docusign_clm_account_id`
- **Configuration**: `localStorage.workflow_configuration`
- All data stored locally in browser

### **API Integration**
- **Base URL**: `https://apiuatna11.springcm.com/v2/YOUR-ACCOUNT-ID`
- **Endpoint**: `/workflows`
- **Method**: POST with workflow name and XML parameters

## 🌐 Deployment

### **Local Development**
```bash
npm install
npm start
# Visit http://localhost:3000
```

### **Production Deployment**
1. **Build**: No build step required (static files + Node.js server)
2. **Deploy**: Copy files to server and run `npm start`
3. **Environment**: Set `PORT` environment variable if needed

### **Sharing with ngrok**
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Start ngrok
ngrok http 3000
```

## 📝 Configuration Examples

### **Simple Customer Form**
```xml
<CustomerData>
    <Full_Name>Jane Smith</Full_Name>
    <Email>jane@company.com</Email>
    <Phone>555-0123</Phone>
    <Company>Smith Industries</Company>
    <Service_Plan>Premium</Service_Plan>
    <Auto_Renew>Yes</Auto_Renew>
</CustomerData>
```

### **Complex Business Form**
```xml
<BusinessApplication>
    <Company_Name>Acme Corporation</Company_Name>
    <Contact_Email>admin@acme.com</Contact_Email>
    <Contact_Phone>555-0199</Contact_Phone>
    <Annual_Revenue>5000000</Annual_Revenue>
    <Industry>Manufacturing</Industry>
    <Employees>250</Employees>
    <Electronic_Documents>Yes</Electronic_Documents>
    <Contract_Duration>24 months</Contract_Duration>
    <Special_Requirements>Require on-site installation and training</Special_Requirements>
</BusinessApplication>
```

## 🔍 Troubleshooting

### **Common Issues**

**"No Configuration Found"**
- Visit `/config.html` and set up workflow configuration
- Ensure XML structure is provided and valid

**"API token not configured"**
- Visit `/admin.html` and save your API token
- Check token is valid and not expired

**"Workflow submission fails"**
- Verify workflow name matches exactly in Docusign CLM
- Check API token permissions
- Ensure XML structure matches workflow requirements

### **System Status**
Check the main page for system status indicators:
- **API Token**: Green ✓ = configured, Red = missing
- **Workflow Configuration**: Shows configured workflow name
- **System Health**: Overall system status

## 🔒 Security

- **API tokens** stored locally in browser (not on server)
- **HTTPS recommended** for production deployments
- **CORS enabled** for cross-origin requests
- **No sensitive data** logged to console in production

## 🤝 Support

For issues:
1. Check browser console for error messages
2. Verify system status on main page
3. Test with simple XML examples first
4. Ensure Docusign CLM connectivity

---

## 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser UI    │    │   Node.js       │    │  Docusign CLM   │
│                 │    │   Proxy         │    │     API         │
│ • Config        │◄──►│                 │◄──►│                 │
│ • Dynamic Form  │    │ • CORS Handler  │    │ • Workflows     │
│ • Tasks         │    │ • API Proxy     │    │ • Tasks         │
│ • Admin         │    │ • Static Files  │    │ • Members       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

The portal provides a complete solution for dynamic Docusign CLM workflow submission with zero hardcoding required!