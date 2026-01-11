# Solr Schema API - Postman Requests

## Add All Fields in One Request (Recommended)

**Method:** POST  
**URL:** `http://localhost:8983/solr/products/schema`  
**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "add-field": [
    {
      "name": "productId",
      "type": "plong",
      "stored": true,
      "indexed": true
    },
    {
      "name": "name",
      "type": "string",
      "stored": true,
      "indexed": true
    },
    {
      "name": "description",
      "type": "text_general",
      "stored": true,
      "indexed": true
    },
    {
      "name": "sku",
      "type": "string",
      "stored": true,
      "indexed": true
    },
    {
      "name": "price",
      "type": "pdouble",
      "stored": true,
      "indexed": true
    },
    {
      "name": "moq",
      "type": "pint",
      "stored": true,
      "indexed": true
    },
    {
      "name": "stockQuantity",
      "type": "pint",
      "stored": true,
      "indexed": true
    },
    {
      "name": "categoryId",
      "type": "plong",
      "stored": true,
      "indexed": true
    },
    {
      "name": "categoryName",
      "type": "string",
      "stored": true,
      "indexed": true
    },
    {
      "name": "supplierId",
      "type": "plong",
      "stored": true,
      "indexed": true
    },
    {
      "name": "supplierName",
      "type": "string",
      "stored": true,
      "indexed": true
    },
    {
      "name": "origin",
      "type": "string",
      "stored": true,
      "indexed": true
    },
    {
      "name": "rating",
      "type": "pdouble",
      "stored": true,
      "indexed": true
    },
    {
      "name": "reviewCount",
      "type": "pint",
      "stored": true,
      "indexed": true
    },
    {
      "name": "tags",
      "type": "strings",
      "stored": true,
      "indexed": true,
      "multiValued": true
    },
    {
      "name": "isFeatured",
      "type": "boolean",
      "stored": true,
      "indexed": true
    },
    {
      "name": "isActive",
      "type": "boolean",
      "stored": true,
      "indexed": true
    },
    {
      "name": "createdAt",
      "type": "pdate",
      "stored": true,
      "indexed": true
    },
    {
      "name": "updatedAt",
      "type": "pdate",
      "stored": true,
      "indexed": true
    },
    {
      "name": "imageUrl",
      "type": "text_general",
      "stored": true,
      "indexed": false
    }
  ]
}
```

---

## Individual Field Additions (Alternative)

If you prefer to add fields one by one:

### 1. Add productId Field

**Method:** POST  
**URL:** `http://localhost:8983/solr/products/schema`  
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "add-field": {
    "name": "productId",
    "type": "plong",
    "stored": true,
    "indexed": true
  }
}
```

### 2. Add name Field

**Body:**
```json
{
  "add-field": {
    "name": "name",
    "type": "string",
    "stored": true,
    "indexed": true
  }
}
```

### 3. Add description Field

**Body:**
```json
{
  "add-field": {
    "name": "description",
    "type": "text_general",
    "stored": true,
    "indexed": true
  }
}
```

### 4. Add imageUrl Field (Important - uses text_general for large base64 data)

**Body:**
```json
{
  "add-field": {
    "name": "imageUrl",
    "type": "text_general",
    "stored": true,
    "indexed": false
  }
}
```

---

## Verify Schema

**Method:** GET  
**URL:** `http://localhost:8983/solr/products/schema/fields`

This will return all fields in the schema.

---

## Delete a Field (if needed)

**Method:** POST  
**URL:** `http://localhost:8983/solr/products/schema`  
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "delete-field": {
    "name": "fieldNameToDelete"
  }
}
```

---

## Common Field Types in Solr

- `string` - Exact match, max 32KB
- `text_general` - Full-text search, unlimited size
- `plong` - Long integer (primitive)
- `pint` - Integer (primitive)
- `pdouble` - Double (primitive)
- `pdate` - Date/time
- `boolean` - True/false
- `strings` - Multi-valued string array

---

## Postman Collection Setup

1. Create new collection: "Solr Schema Management"
2. Add environment variable:
   - `SOLR_URL`: `http://localhost:8983`
3. Use `{{SOLR_URL}}/solr/products/schema` in requests
4. Save the bulk request as "Add All Product Fields"
5. Test with the verify endpoint

---

## Expected Response

Success response:
```json
{
  "responseHeader": {
    "status": 0,
    "QTime": 123
  }
}
```

Error response (field already exists):
```json
{
  "responseHeader": {
    "status": 400,
    "QTime": 5
  },
  "error": {
    "msg": "Field 'fieldName' already exists."
  }
}
```
