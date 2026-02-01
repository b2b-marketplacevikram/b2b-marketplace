FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /build

# Copy parent pom and common module first (for caching)
COPY ../pom.xml ./pom.xml
COPY ../common ./common

# Copy api-gateway
COPY . ./api-gateway

# Build the service
RUN mvn clean install -pl common -am
RUN mvn clean package -pl api-gateway -am -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy jar from build stage
COPY --from=build /build/api-gateway/target/*.jar app.jar

# Expose port (Railway will override with $PORT)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-Xmx512m", "-Xms256m", "-jar", "app.jar"]
