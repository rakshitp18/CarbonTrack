package com.team7.carbontrack.service;

import com.team7.carbontrack.entity.Goal;
import org.springframework.context.ApplicationEvent;

public class GoalAchievedEvent extends ApplicationEvent {
    private final Long userId;
    private final Goal goal;

    public GoalAchievedEvent(Object source, Long userId, Goal goal) {
        super(source);
        this.userId = userId;
        this.goal = goal;
    }

    public Long getUserId() {
        return userId;
    }

    public Goal getGoal() {
        return goal;
    }
}
