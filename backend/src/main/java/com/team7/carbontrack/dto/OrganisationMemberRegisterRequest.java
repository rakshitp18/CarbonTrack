package com.team7.carbontrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record OrganisationMemberRegisterRequest(
        @NotBlank @Size(max = 12) String joinCode,
        @NotBlank @Size(max = 50) String employeeId,
        @NotBlank @Size(max = 100) String department,
        @NotBlank @Size(max = 100) String designation,
        @NotBlank @Size(min = 3, max = 50) @Pattern(regexp = "^[a-zA-Z0-9_.-]+$") String username,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String password
) {}
