package com.zask.workspace.aspect;

import com.zask.workspace.annotation.AuditAction;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
public class AuditAspect {

    @Autowired
    private RestTemplate restTemplate;

    private static final String NOTIFICATION_SERVICE_URL = "http://notification-service/api/v1/audit";

    @AfterReturning(pointcut = "@annotation(auditAction)", returning = "result")
    public void auditLog(JoinPoint joinPoint, AuditAction auditAction, Object result) {
        try {
            Map<String, Object> log = new HashMap<>();
            log.put("action", auditAction.action());
            log.put("entityType", auditAction.entityType());
            
            // Try to extract entity ID from result if it has one
            // This is a simple implementation, ideally we'd use reflection or a common interface
            log.put("entityId", extractEntityId(result));
            
            log.put("details", "Performed " + auditAction.action() + " on " + auditAction.entityType());
            
            // For now, using a placeholder for the user performing the action
            // In a real scenario, we'd extract this from SecurityContext or JWT
            log.put("performedBy", 1); // Admin ID
            log.put("performedByName", "PLATFORM_ADMIN");

            restTemplate.postForObject(NOTIFICATION_SERVICE_URL, log, Map.class);
        } catch (Exception e) {
            // Log the error but don't break the main flow
            System.err.println("Failed to create audit log: " + e.getMessage());
        }
    }

    private String extractEntityId(Object result) {
        if (result == null) return "N/A";
        try {
            // Try to find a field named 'id' or 'workspaceId' etc.
            // Simplified for now
            return result.toString();
        } catch (Exception e) {
            return "UNKNOWN";
        }
    }
}
