package com.team7.carbontrack;

import com.team7.carbontrack.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;

/**
 * CarbonTrack - Milestone 1
 * User Profiles, Activity Logging Schema & Emission Calculation Engine.
 */
@SpringBootApplication(exclude = {OAuth2ClientAutoConfiguration.class})
@EnableConfigurationProperties(JwtProperties.class)
@EnableCaching
public class CarbontrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(CarbontrackApplication.class, args);
    }
}
