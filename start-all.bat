@echo off
echo Starting all Zask Microservices...

start "Eureka Server" cmd /k "cd D:\Zask\eureka-server && .\mvnw spring-boot:run"
timeout /t 20

start "Auth Service" cmd /k "cd D:\Zask\auth-service && .\mvnw spring-boot:run"
timeout /t 8

start "Workspace Service" cmd /k "cd D:\Zask\workspace-service && .\mvnw spring-boot:run"
timeout /t 8

start "Board Service" cmd /k "cd D:\Zask\board-service && .\mvnw spring-boot:run"
timeout /t 8

start "List Service" cmd /k "cd D:\Zask\list-service && .\mvnw spring-boot:run"
timeout /t 8

start "Card Service" cmd /k "cd D:\Zask\card-service && .\mvnw spring-boot:run"
timeout /t 8

start "Comment Service" cmd /k "cd D:\Zask\comment-service && .\mvnw spring-boot:run"
timeout /t 8

start "Label Service" cmd /k "cd D:\Zask\label-service && .\mvnw spring-boot:run"
timeout /t 8

start "Notification Service" cmd /k "cd D:\Zask\notification-service && .\mvnw spring-boot:run"
timeout /t 8

start "API Gateway" cmd /k "cd D:\Zask\api-gateway && .\mvnw spring-boot:run"

echo All services started!
pause
