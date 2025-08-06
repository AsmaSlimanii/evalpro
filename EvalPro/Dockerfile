FROM openjdk:17-jdk-slim
EXPOSE 8080
ADD target/evalpro-1.0.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
