# Railway Deployment POM.XML Fix Guide

## Problem
When deploying individual microservices to Railway, Maven fails because services reference a parent POM (`b2b-marketplace-parent`) that Railway cannot find during build.

## Solution
Convert all service pom.xml files to use Spring Boot's parent directly instead of the custom parent.

## Services Fixed
✅ cart-service - Updated to standalone pom.xml
✅ user-service - Updated to standalone pom.xml
✅ product-service - Updated to standalone pom.xml
✅ payment-service - Updated to standalone pom.xml
✅ order-service - Updated to standalone pom.xml
✅ search-service - Updated to standalone pom.xml
✅ messaging-service - Updated to standalone pom.xml
✅ notification-service - Updated to standalone pom.xml
✅ email-service - Updated to standalone pom.xml
✅ admin-service - Already had standalone pom.xml

## What Changes

### Before (Multi-module setup):
```xml
<parent>
    <groupId>com.b2b.marketplace</groupId>
    <artifactId>b2b-marketplace-parent</artifactId>
    <version>1.0.0</version>
</parent>

<artifactId>user-service</artifactId>
```

### After (Standalone for Railway):
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
    <relativePath/>
</parent>

<groupId>com.b2b.marketplace</groupId>
<artifactId>user-service</artifactId>
<version>1.0.0</version>
```

## Additional Changes Needed
- Add explicit versions for dependencies that were managed by parent
- Add `<properties>` section for Java version and other properties
- Specify MySQL connector version explicitly

## Status
✅ **COMPLETE!** All backend services now have standalone pom.xml files and can be deployed independently to Railway.

## Next Steps for Railway Deployment

1. **Deploy each service to Railway:**
   - Create a new service in Railway for each backend service
   - Connect to your GitHub repository
   - Set the root directory to the service folder (e.g., `backend/cart-service`)
   - Railway will auto-detect the Maven build

2. **Set environment variables** (as per RAILWAY_DEPLOYMENT_CONFIG.md):
   - `ALLOWED_ORIGINS` - Your frontend URL
   - Database connection details (if different from Railway MySQL)
   - Service-specific variables (Stripe keys, JWT secrets, etc.)

3. **Verify each deployment:**
   ```bash
   curl https://your-service.railway.app/actuator/health
   ```

All services are now ready for individual deployment! 🚀
