package com.company.opexhub.controller;

import com.company.opexhub.dto.ApiResponse;
import com.company.opexhub.entity.WorkflowStage;
import com.company.opexhub.security.UserPrincipal;
import com.company.opexhub.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workflow")
public class WorkflowController {

    @Autowired
    private WorkflowService workflowService;

    @GetMapping("/initiative/{initiativeId}")
    public List<WorkflowStage> getWorkflowStages(@PathVariable Long initiativeId) {
        return workflowService.getWorkflowStages(initiativeId);
    }

    @PostMapping("/stage/{stageId}/approve")
    public ResponseEntity<?> approveStage(@PathVariable Long stageId,
                                        @RequestBody(required = false) String comments,
                                        @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            WorkflowStage stage = workflowService.approveStage(stageId, currentUser.getFullName(), comments);
            return ResponseEntity.ok(new ApiResponse(true, "Stage approved successfully", stage));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/stage/{stageId}/reject")
    public ResponseEntity<?> rejectStage(@PathVariable Long stageId,
                                       @RequestBody String comments,
                                       @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            WorkflowStage stage = workflowService.rejectStage(stageId, currentUser.getFullName(), comments);
            return ResponseEntity.ok(new ApiResponse(true, "Stage rejected", stage));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/pending/{userId}")
    public List<WorkflowStage> getPendingApprovals(@PathVariable Long userId) {
        return workflowService.getPendingApprovals(userId);
    }
}