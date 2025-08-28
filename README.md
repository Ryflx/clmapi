# Docusign CLM Portal

A dynamic, configurable portal for submitting workflows to Docusign CLM with custom form generation.

## 🚀 Quick Start

1. **Start the server**: `npm start`
2. **Configure API token**: Visit `/admin.html`
3. **Configure workflow**: Visit `/config.html` 
4. **Submit workflows**: Visit `/dynamic-form.html`

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

### **⚙️ Admin Setup** (`/admin.html`)
- Centralized API token management
- System configuration
- Security settings

## 🛠️ How It Works

### **1. Configuration Process**
1. **Set API Token**: Configure once in Admin panel
2. **Define Workflow**: Set workflow name in Configuration
3. **Provide XML Structure**: Paste example XML parameters
4. **Generate Form**: System creates form fields automatically

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
2. Enter your Docusign CLM API token
3. Save token (stored securely in browser)

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

## 🔧 Technical Details

### **Field Type Detection**
- **Email**: Contains `@` symbol → Email input
- **Phone**: Matches phone pattern → Phone input  
- **Number**: Numeric values → Number input
- **Yes/No**: `Yes`/`No` values → Dropdown select
- **Long text**: >50 characters → Textarea
- **Default**: Text input

### **Storage**
- **API Token**: `localStorage.docusign_clm_token`
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