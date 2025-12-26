# 🚀 Solr Quick Start Guide

This project now uses Apache Solr for search. Use this guide to get Solr running and create the `products` collection.

1. Run the provided setup script (Windows PowerShell):

```powershell
# From project root
.\SETUP_SOLR.ps1
```

2. Verify Solr is running at: `http://localhost:8983/solr`

3. Verify the `products` collection exists: `http://localhost:8983/solr/#/~cores` or via Collections API:

```
http://localhost:8983/solr/admin/collections?action=LIST
```

4. If you need to inspect schema:

```
http://localhost:8983/solr/products/schema/fields
```

Notes
- The script downloads Solr $solrVersion to the project folder and starts it in background. Adjust `SETUP_SOLR.ps1` if you already have Solr managed separately.
- The `products` collection is created with the `_default` config set and fields added via Schema API.
- If you deploy to a Linux server or Docker, consider using Solr official Docker image and map persistent volumes for data.
