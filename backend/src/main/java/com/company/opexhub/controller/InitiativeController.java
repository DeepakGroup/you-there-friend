package com.company.opexhub.controller;

import com.company.opexhub.dto.ApiResponse;
import com.company.opexhub.dto.InitiativeRequest;
import com.company.opexhub.entity.Initiative;
import com.company.opexhub.security.UserPrincipal;
import com.company.opexhub.service.InitiativeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/initiatives")
@CrossOrigin(origins = "*")
public class InitiativeController {

    @Autowired
    private InitiativeService initiativeService;

    @GetMapping
    public Page<Initiative> getAllInitiatives(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String site,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return initiativeService.searchInitiatives(status, site, search, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Initiative> getInitiativeById(@PathVariable Long id) {
        return initiativeService.getInitiativeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createInitiative(@Valid @RequestBody InitiativeRequest request,
                                            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Initiative initiative = initiativeService.createInitiative(request, currentUser.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Initiative created successfully", initiative));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInitiative(@PathVariable Long id,
                                            @Valid @RequestBody InitiativeRequest request) {
        try {
            Initiative initiative = initiativeService.updateInitiative(id, request);
            return ResponseEntity.ok(new ApiResponse(true, "Initiative updated successfully", initiative));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInitiative(@PathVariable Long id) {
        try {
            initiativeService.deleteInitiative(id);
            return ResponseEntity.ok(new ApiResponse(true, "Initiative deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}