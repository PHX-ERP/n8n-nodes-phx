# PHX ERP Node for n8n

This n8n community node provides integration with PHX ERP system, allowing you to manage products, addresses, and documents through n8n workflows.

## Features

- **Product Management**: Get, update, and delete products
- **Address Management**: Get, update, and delete addresses  
- **Document Management**: Get, update, and delete documents
- **Advanced Filtering**: Query builder with multiple operators
- **Input Filtering**: Filter data using field-based criteria
- **Data Simplification**: Option to return only essential fields and flatten nested data
- **Bulk Operations**: Support for processing multiple items (except delete operations)

## Installation

1. Start your n8n instance if not done so already
2. Go to the bottom left corner and hit the 3 dots on your user account
3. Head over to Settings and then Community Nodes
4. Enter @phx-erp/n8n-nodes-phx and press Install

## Credentials Setup

Before using the PHX node, you need to configure your PHX API credentials:

1. Go to PHX, Settings then Users, add a new user as "API User" checked
2. Generate a new API key and keep it in a safe place
3. In n8n, go to **Credentials** → **Add Credential**
4. Search for "PHX API" and select it
5. Fill in the required fields:
   - **Web URL**: Your PHX server URL (e.g., `https://your-phx-server.com`)
   - **API Key**: Your PHX API authentication key

### Resources

The PHX node supports three main resources:

- **Product**: Manage product information
- **Address**: Manage address/contact information  
- **Document**: Manage document records

### Operations

For each resource, you can perform the following operations:

#### Get Many
Retrieve multiple records with optional filtering and querying capabilities.

**Parameters:**
- **Query Builder**: Add field-based queries with operators (contains, equals, greater than, etc.)
- **Input Filter**: Filter data using specific field values
- **Simplify**: Whether to return only the 10 most relevant fields and flatten nested fields

#### Update
Update existing records based on the input data.

**Parameters:**
- **Field Values**: Specify field values to set during update operations

#### Delete
Remove a single record from the system.

**Note**: Delete operations can only process one item at a time.

## Usage Examples

### Example 1: Get Products with Filtering

```json
{
  "resource": "product",
  "operation": "getProducts",
  "queryBuilder": {
    "query": [
      {
        "query": "name",
        "operator": "contains", 
        "value": "laptop"
      }
    ]
  },
  "simplify": true
}
```

### Example 2: Update Address

```json
{
  "resource": "address", 
  "operation": "upsertAddresses",
  "modifiers": {
    "modifier": [
      {
        "modifiers": "name",
        "value": "John Doe"
      },
      {
        "modifiers": "email", 
        "value": "john@example.com"
      }
    ]
  }
}
```

### Example 3: Delete Document

```json
{
  "resource": "document",
  "operation": "deleteDocument"
}
```

**Input Data Required:**
```json
{
  "id": "document-id-to-delete"
}
```

## Query Operators

The Query Builder supports the following operators:

- **Between**: Value is between two specified values
- **Contains**: Field contains the specified value
- **Ends With**: Field ends with the specified value
- **Equal**: Field equals the specified value
- **Greater Than**: Field is greater than the specified value
- **Greater Than or Equal**: Field is greater than or equal to the specified value
- **In**: Field value is in the specified list
- **Is Not Null**: Field has a value
- **Is Null**: Field is empty
- **Less Than**: Field is less than the specified value
- **Less Than or Equal**: Field is less than or equal to the specified value
- **Not Between**: Value is not between two specified values
- **Not Equal**: Field does not equal the specified value
- **Not In**: Field value is not in the specified list
- **Number Starts With**: Numeric field starts with the specified value
- **Starts With**: Field starts with the specified value

## Error Handling

The node provides detailed error messages to help troubleshoot issues:

- **Connection Errors**: Clear guidance on credential configuration
- **Timeout Errors**: Information about server performance issues
- **Validation Errors**: Specific field requirements and data format issues
- **Operation Errors**: Guidance on supported operations and limitations

## Limitations

- Delete operations can only process one item at a time
- Some operations may have rate limits depending on your PHX server configuration

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/PHX-ERP/n8n-nodes-phx).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
