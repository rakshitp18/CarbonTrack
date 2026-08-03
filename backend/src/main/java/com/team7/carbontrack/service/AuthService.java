package com.team7.carbontrack.service;

import com.team7.carbontrack.dto.AuthResponse;
import com.team7.carbontrack.dto.LoginRequest;
import com.team7.carbontrack.dto.RegisterRequest;
import com.team7.carbontrack.dto.UserProfileResponse;
import com.team7.carbontrack.config.JwtProperties;
import com.team7.carbontrack.entity.AuthProvider;
import com.team7.carbontrack.entity.User;
import com.team7.carbontrack.exception.DuplicateResourceException;
import com.team7.carbontrack.exception.InvalidCredentialsException;
import com.team7.carbontrack.exception.ResourceNotFoundException;
import com.team7.carbontrack.repository.UserRepository;
import com.team7.carbontrack.repository.OrganisationRepository;
import com.team7.carbontrack.entity.Organisation;
import com.team7.carbontrack.entity.Role;
import com.team7.carbontrack.dto.OrganisationRegisterRequest;
import com.team7.carbontrack.dto.OrganisationMemberRegisterRequest;
import com.team7.carbontrack.security.JwtService;
import com.team7.carbontrack.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final OrganisationRepository organisationRepository;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                        JwtService jwtService, JwtProperties jwtProperties, OrganisationRepository organisationRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.organisationRepository = organisationRepository;
    }

    /** Creates an isolated organisation tenant and its first ORG_ADMIN account. */
    @Transactional
    public AuthResponse registerOrganisation(OrganisationRegisterRequest request) {
        if (organisationRepository.findByName(request.organisationName()).isPresent()) {
            throw new DuplicateResourceException("An organisation with this name already exists");
        }
        if (userRepository.existsByUsernameIgnoreCase(request.username()) || userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("Username or email is already in use");
        }
        Organisation organisation = organisationRepository.save(Organisation.builder().name(request.organisationName()).joinCode(nextJoinCode()).build());
        User admin = userRepository.save(User.builder()
                .username(request.username()).email(request.email()).passwordHash(passwordEncoder.encode(request.password()))
                .authProvider(AuthProvider.LOCAL).role(Role.ORG_ADMIN).orgId(organisation.getId())
                .employeeId(request.employeeId()).department(request.department()).designation(request.designation()).build());
        organisation.setAdminUserId(admin.getId());
        organisationRepository.save(organisation);
        return issueTokens(admin);
    }

    @Transactional
    public AuthResponse registerOrganisationMember(OrganisationMemberRegisterRequest request) {
        Organisation organisation = organisationRepository.findByJoinCode(request.joinCode().trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Company code was not found"));
        if (userRepository.existsByUsernameIgnoreCase(request.username()) || userRepository.existsByEmailIgnoreCase(request.email())) throw new DuplicateResourceException("Username or email is already in use");
        if (userRepository.existsByOrgIdAndEmployeeId(organisation.getId(), request.employeeId())) throw new DuplicateResourceException("That employee ID already belongs to this company");
        User member = userRepository.save(User.builder().username(request.username()).email(request.email()).passwordHash(passwordEncoder.encode(request.password()))
                .authProvider(AuthProvider.LOCAL).role(Role.USER).orgId(organisation.getId()).employeeId(request.employeeId()).department(request.department()).designation(request.designation()).build());
        return issueTokens(member);
    }

    private String nextJoinCode() {
        String code;
        do { code = String.format("%08d", java.util.concurrent.ThreadLocalRandom.current().nextInt(10_000_000, 100_000_000)); }
        while (organisationRepository.findByJoinCode(code).isPresent());
        return code;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Fail fast with a clear message rather than letting the DB's unique
        // constraint throw a raw SQL exception up to the client.
        if (userRepository.existsByUsernameIgnoreCase(request.username())) {
            throw new DuplicateResourceException("Username is already taken: " + request.username());
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        if (request.referrerId() != null && !userRepository.existsById(request.referrerId())) {
            throw new ResourceNotFoundException("The invitation link is no longer valid");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password())) // never store plain text
                .authProvider(AuthProvider.LOCAL)
                .referredByUserId(request.referrerId())
                .build();

        User saved = userRepository.save(user);
        return issueTokens(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameIgnoreCase(request.usernameOrEmail())
                .or(() -> userRepository.findByEmailIgnoreCase(request.usernameOrEmail()))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username/email or password"));

        if (user.getPasswordHash() == null) {
            // This account was created via Google OAuth2 and has no local password to check.
            throw new InvalidCredentialsException("This account uses Google sign-in. Please log in with Google.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid username/email or password");
        }

        return issueTokens(user);
    }

    private AuthResponse issueTokens(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtService.generateAccessToken(principal, user.getId());
        String refreshToken = jwtService.generateRefreshToken(principal, user.getId());
        return AuthResponse.of(accessToken, refreshToken, jwtProperties.accessTokenExpirationMs(),
                UserProfileResponse.from(user));
    }
}
