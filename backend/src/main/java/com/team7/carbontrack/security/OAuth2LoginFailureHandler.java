package com.team7.carbontrack.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** Sends OAuth failures back to the React login page with an actionable message. */
@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2LoginFailureHandler.class);

    @Value("${app.oauth2.login-failure-redirect-uri:http://localhost:5173/login?oauthError=true}")
    private String loginFailureRedirectUri;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        log.error("OAuth2 Login failed: {}", exception.getMessage(), exception);
        String redirectBase = loginFailureRedirectUri;
        String host = request.getHeader("host");
        String serverName = request.getServerName();
        if (redirectBase.contains("localhost") && ((serverName != null && serverName.contains("onrender.com")) || (host != null && host.contains("onrender.com")))) {
            redirectBase = "https://carbon-track-beta.vercel.app/login?oauthError=true";
        }
        response.sendRedirect(redirectBase);
    }
}
