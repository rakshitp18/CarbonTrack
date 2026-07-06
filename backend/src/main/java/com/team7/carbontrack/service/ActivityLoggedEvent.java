
package com.team7.carbontrack.service;

import com.team7.carbontrack.entity.ActivityLog;
import org.springframework.context.ApplicationEvent;

public class ActivityLoggedEvent extends ApplicationEvent {
    private final Long userId;
    private final ActivityLog activityLog;

    public ActivityLoggedEvent(Object source, Long userId, ActivityLog activityLog) {
        super(source);
        this.userId = userId;
        this.activityLog = activityLog;
    }

    public Long getUserId() {
        return userId;
    }

    public ActivityLog getActivityLog() {
        return activityLog;
    }
}
