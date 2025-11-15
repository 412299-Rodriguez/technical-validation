# backend/Dockerfile

# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# Copiamos el proyecto real ubicado dentro de ficticia-client-service/ficticia-client-service
COPY ficticia-client-service/ficticia-client-service/pom.xml ./pom.xml
COPY ficticia-client-service/ficticia-client-service/src ./src
RUN mvn -B clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
