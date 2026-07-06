package com.team7.carbontrack;

import com.team7.carbontrack.entity.*;
import com.team7.carbontrack.repository.*;
import com.team7.carbontrack.service.GoalService;
import com.team7.carbontrack.service.BadgeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class GoalAndBadgeTest {

    @Autowired
    private GoalService goalService;

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Test
    void testCreateGoalAndGoalProgress() {
        // Create user
        User user = User.builder()
                .username("test_goal_user")
                .email("goal@test.com")
                .role(Role.USER)
                .authProvider(AuthProvider.LOCAL)
                .preferredUnitSystem(UnitSystem.METRIC)
                .goalVisibility(GoalVisibility.PUBLIC)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        // Create goal
        Goal goal = goalService.createGoal(user.getId(), new BigDecimal("10.00"), 30);
        assertThat(goal).isNotNull();
        assertThat(goal.getStatus()).isEqualTo(GoalStatus.ACTIVE);
        assertThat(goal.getPeriodDays()).isEqualTo(30);
        assertThat(goal.getTargetReductionPct()).isEqualByComparingTo("10.00");
        assertThat(goal.getBaselineCo2eKg()).isGreaterThan(BigDecimal.ZERO);
    }
}
