package com.team7.carbontrack;

import com.team7.carbontrack.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * CarbonTrack - Milestone 1
 * User Profiles, Activity Logging Schema & Emission Calculation Engine.
 */
@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class CarbonTrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(CarbonTrackApplication.class, args);
    }
}
