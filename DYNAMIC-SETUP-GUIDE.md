# Dynamic Workflow Configuration Guide

## Overview

This portal now supports **dynamic workflow configuration**, allowing you to:
- Configure any Docusign CLM workflow
- Define custom form fields based on your XML structure
- Generate forms dynamically from your workflow parameters
- Submit to any workflow without hardcoded values

## Quick Start

### 1. Configure Your Workflow

1. **Go to Configuration Page**
   - Visit `config.html` or click "🔧 Workflow Configuration" from the home page

2. **Set API Token**
   - Enter your Docusign CLM API token
   - Click "Save Token"

3. **Configure Workflow Settings**
   - **Workflow Name**: Enter the exact name of your workflow in Docusign CLM
   - **Base URL** (optional): Custom base URL if different from default
   - **Example Parameters**: Paste your XML structure (see example below)

4. **Save Configuration**
   - Click "Save Configuration"
   - The system will parse your XML and generate form field definitions

### 2. Use Dynamic Form

1. **Go to Dynamic Form Page**
   - Visit `dynamic-form.html` or click "📝 Dynamic Form" from the home page

2. **Fill Out Generated Form**
   - Form fields are automatically generated from your XML structure
   - Field types are intelligently detected (email, number, text, select, etc.)

3. **Submit Workflow**
   - Click "Submit Workflow"
   - XML is generated dynamically and sent to your configured workflow

## Example XML Structure

Here's an example of what to paste in the "Example Parameters" field:

```xml
<TemplateFieldData>
    <Customer_Name>John Doe</Customer_Name>
    <Email_Address>john@example.com</Email_Address>
    <Phone_Number>555-1234</Phone_Number>
    <Company_Name>Acme Corp</Company_Name>
    <Service_Type>Premium</Service_Type>
    <Contract_Duration>12 months</Contract_Duration>
    <Electronic_Invoice>Yes</Electronic_Invoice>
    <SMS_Notifications>No</SMS_Notifications>
    <Special_Requirements>Please call before delivery</Special_Requirements>
</TemplateFieldData>
```

## Field Type Detection

The system automatically detects field types based on sample values:

| Sample Value | Detected Type | Form Field |
|-------------|---------------|------------|
| `john@example.com` | email | Email input |
| `555-1234` | tel | Phone input |
| `123` | number | Number input |
| `Yes` or `No` | select | Dropdown with Yes/No options |
| Long text (>50 chars) | textarea | Text area |
| Default | text | Text input |

## XML Structure Requirements

- **Root Element**: Can be any name (e.g., `TemplateFieldData`, `params`, `CustomerData`)
- **Field Names**: Use underscores or camelCase (e.g., `Customer_Name`, `customerName`)
- **Sample Values**: Provide realistic examples to help with field type detection
- **Nested Elements**: Currently not supported (flat structure only)

## Configuration Storage

All configuration is stored locally in your browser:
- `workflow_configuration`: Your workflow settings and field definitions
- `docusign_clm_token`: Your API token (encrypted in browser storage)

## API Integration

The system works with any Docusign CLM environment:
- **Default**: `https://apiuatna11.springcm.com/v2/YOUR-ACCOUNT-ID`
- **Custom**: Configure your own base URL in settings

## Features

### ✅ What's Supported
- Any workflow name
- Custom XML structures
- Dynamic form generation
- Field type detection
- XML preview
- Local configuration storage
- Token management

### ❌ Current Limitations
- Flat XML structure only (no nested elements)
- Simple field types (text, email, number, select, textarea)
- Browser-based storage only
- Single workflow per configuration

## Troubleshooting

### Common Issues

1. **"No Configuration Found"**
   - Go to `config.html` and set up your workflow first
   - Make sure you've saved the configuration

2. **"Please configure your API token"**
   - Add your Docusign CLM API token in the configuration page
   - Token is stored securely in browser local storage

3. **Form fields not generating correctly**
   - Check your XML structure for proper formatting
   - Ensure you have sample values in each XML element
   - Verify XML tags are properly closed

4. **Workflow submission fails**
   - Verify your workflow name matches exactly in Docusign CLM
   - Check that your API token is valid and not expired
   - Ensure your account has access to the specified workflow

### Testing Your Configuration

1. **Preview Form**: Use "Preview Form" button in configuration to see generated fields
2. **Preview XML**: Use "Preview XML" button in dynamic form to see generated XML
3. **Test Configuration**: Use "Test Configuration" button to validate settings

## Migration from Fixed Workflows

If you're migrating from the original Vodafone-specific setup:

1. **Extract your XML structure** from the existing `createXMLParams()` or `createAgentXMLParams()` functions
2. **Copy the XML template** and paste it into the configuration
3. **Configure your workflow name** (previously hardcoded)
4. **Test with dynamic form** before switching over

## Advanced Usage

### Custom Field Types

You can modify field types by editing the configuration after saving:

```javascript
// Access stored configuration
const config = JSON.parse(localStorage.getItem('workflow_configuration'));

// Modify field types
config.fields[0].type = 'textarea'; // Change first field to textarea
config.fields[1].options = ['Option1', 'Option2', 'Option3']; // Add custom options

// Save back
localStorage.setItem('workflow_configuration', JSON.stringify(config));
```

### Multiple Configurations

To support multiple workflows, you can:
1. Export/import configurations manually
2. Use different browser profiles
3. Clear and reconfigure as needed

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify XML structure is valid
3. Test with simple examples first
4. Ensure Docusign CLM access is working

---

## Example Complete Setup

Here's a complete example for a customer onboarding workflow:

### 1. Workflow Name
```
Customer Onboarding Workflow
```

### 2. Example XML
```xml
<CustomerData>
    <Full_Name>Jane Smith</Full_Name>
    <Email_Address>jane@company.com</Email_Address>
    <Phone_Number>555-0123</Phone_Number>
    <Company_Name>Smith Industries</Company_Name>
    <Industry>Manufacturing</Industry>
    <Annual_Revenue>500000</Annual_Revenue>
    <Preferred_Contact>Email</Preferred_Contact>
    <Marketing_Emails>Yes</Marketing_Emails>
    <Terms_Accepted>Yes</Terms_Accepted>
    <Comments>Looking for enterprise solution</Comments>
</CustomerData>
```

### 3. Generated Form
This will create a form with:
- Text input for Full Name
- Email input for Email Address  
- Phone input for Phone Number
- Text inputs for Company Name and Industry
- Number input for Annual Revenue
- Select dropdown for Preferred Contact
- Yes/No dropdowns for Marketing Emails and Terms Accepted
- Textarea for Comments

The form will generate proper XML and submit to your "Customer Onboarding Workflow" in Docusign CLM!