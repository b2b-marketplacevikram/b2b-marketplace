FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /build

# Copy parent pom and common module first (for caching)
COPY pom.xml ./
COPY common ./common

# Copy cart-service
COPY cart-service ./cart-service

# Build the service
WORKDIR /build
RUN mvn clean install -pl common -am
RUN mvn clean package -pl cart-service -am -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy jar from build stage
COPY --from=build /build/cart-service/target/*.jar app.jar

# Expose port
EXPOSE 8085

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8085}/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-Xmx512m", "-Xms256m", "-jar", "app.jar"]
