package com.zask.notification.resource;

import com.zask.notification.entity.AuditLog;
import com.zask.notification.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@CrossOrigin(origins = "*")
@Tag(name = "Audit Log Management", description = "Endpoints for retrieving system activity logs and creating log records")
public class AuditResource {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping
    @Operation(summary = "Get all audit logs", description = "Retrieves a chronologically ordered list of system activity logs.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Audit logs retrieved successfully")
    })
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @PostMapping
    @Operation(summary = "Create an audit log", description = "Creates and saves a system activity log.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Audit log created successfully")
    })
    public ResponseEntity<AuditLog> createLog(@RequestBody AuditLog log) {
        return ResponseEntity.ok(auditLogRepository.save(log));
    }
}
