package com.b2b.marketplace.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * API Gateway - Single entry point for all B2B Marketplace services
 * 
 * This gateway routes all frontend requests to the appropriate backend service.
 * 
 * Benefits:
 * - Single URL for frontend to call
 * - Centralized CORS configuration
 * - Request/Response logging
 * - Rate limiting (can be added)
 * - Authentication (can be added)
 * 
 * Routes:
 * - /api/users/**     -> User Service
 * - /api/products/**  -> Product Service
 * - /api/orders/**    -> Order Service
 * - /api/payments/**  -> Payment Service
 * - /api/cart/**      -> Cart Service
 * - /api/notifications/** -> Notification Service
 * - /api/messages/**  -> Messaging Service
 * - /api/emails/**    -> Email Service
 * - /api/search/**    -> Search Service
 * - /api/admin/**     -> Admin Service
 */
@SpringBootApplication
public class ApiGatewayApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
