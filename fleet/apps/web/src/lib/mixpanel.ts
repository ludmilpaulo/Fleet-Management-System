import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
const MIXPANEL_TOKEN = 'c1cb0b3411115435a0d45662ad7a97e4';

if (typeof window !== 'undefined') {
  mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: true,
    record_sessions_percent: 100,
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage',
  });
}

// Track events
export const analytics = {
  // User events
  identify: (userId: string, properties?: Record<string, any>) => {
    mixpanel.identify(userId);
    if (properties) {
      mixpanel.people.set(properties);
    }
  },

  track: (eventName: string, properties?: Record<string, any>) => {
    mixpanel.track(eventName, properties);
  },

  // Authentication events
  trackSignup: (userId: string, role: string, company: string) => {
    mixpanel.alias(userId);
    mixpanel.people.set({
      $name: userId,
      $email: userId,
      role: role,
      company: company,
      signup_date: new Date().toISOString(),
    });
    mixpanel.track('User Signup', {
      role,
      company,
      method: 'email',
    });
  },

  trackLogin: (userId: string, role: string, company: string) => {
    mixpanel.identify(userId);
    mixpanel.track('User Login', {
      role,
      company,
      login_time: new Date().toISOString(),
    });
  },

  trackLogout: (userId: string) => {
    mixpanel.track('User Logout', {
      user_id: userId,
      logout_time: new Date().toISOString(),
    });
  },

  // Page view events
  trackPageView: (pageName: string, properties?: Record<string, any>) => {
    mixpanel.track('Page View', {
      page_name: pageName,
      ...properties,
    });
  },

  // Dashboard events
  trackDashboardView: (dashboardType: string, userId: string, company: string) => {
    mixpanel.track('Dashboard View', {
      dashboard_type: dashboardType,
      user_id: userId,
      company: company,
    });
  },

  // Vehicle events
  trackVehicleCreate: (vehicleId: string, make: string, model: string) => {
    mixpanel.track('Vehicle Created', {
      vehicle_id: vehicleId,
      make,
      model,
    });
  },

  trackVehicleUpdate: (vehicleId: string, changes: Record<string, any>) => {
    mixpanel.track('Vehicle Updated', {
      vehicle_id: vehicleId,
      changes: Object.keys(changes),
    });
  },

  trackVehicleDelete: (vehicleId: string) => {
    mixpanel.track('Vehicle Deleted', {
      vehicle_id: vehicleId,
    });
  },

  // Shift events
  trackShiftStart: (shiftId: string, vehicleId: string, driverId: string) => {
    mixpanel.track('Shift Started', {
      shift_id: shiftId,
      vehicle_id: vehicleId,
      driver_id: driverId,
      start_time: new Date().toISOString(),
    });
  },

  trackShiftEnd: (shiftId: string, duration: number, distance: number) => {
    mixpanel.track('Shift Ended', {
      shift_id: shiftId,
      duration_minutes: duration,
      distance_km: distance,
      end_time: new Date().toISOString(),
    });
  },

  // Inspection events
  trackInspectionCreate: (inspectionId: string, vehicleId: string) => {
    mixpanel.track('Inspection Created', {
      inspection_id: inspectionId,
      vehicle_id: vehicleId,
    });
  },

  trackInspectionComplete: (inspectionId: string, status: string, itemsChecked: number) => {
    mixpanel.track('Inspection Completed', {
      inspection_id: inspectionId,
      status,
      items_checked: itemsChecked,
    });
  },

  trackPhotoCapture: (context: string, photoCount: number) => {
    mixpanel.track('Photo Captured', {
      context,
      photo_count: photoCount,
    });
  },

  // Issue events
  trackIssueCreate: (issueId: string, priority: string, vehicleId: string) => {
    mixpanel.track('Issue Reported', {
      issue_id: issueId,
      priority,
      vehicle_id: vehicleId,
    });
  },

  trackIssueAssign: (issueId: string, assignedTo: string) => {
    mixpanel.track('Issue Assigned', {
      issue_id: issueId,
      assigned_to: assignedTo,
    });
  },

  trackIssueResolve: (issueId: string, resolutionTime: number) => {
    mixpanel.track('Issue Resolved', {
      issue_id: issueId,
      resolution_time_hours: resolutionTime,
    });
  },

  // Subscription events
  trackSubscriptionView: (currentPlan: string, trialDaysRemaining: number) => {
    mixpanel.track('Subscription Page View', {
      current_plan: currentPlan,
      trial_days_remaining: trialDaysRemaining,
    });
  },

  trackPlanUpgrade: (fromPlan: string, toPlan: string, billingCycle: string) => {
    mixpanel.track('Plan Upgraded', {
      from_plan: fromPlan,
      to_plan: toPlan,
      billing_cycle: billingCycle,
    });
  },

  trackTrialExpiring: (daysRemaining: number, company: string) => {
    mixpanel.track('Trial Expiring Warning Shown', {
      days_remaining: daysRemaining,
      company,
    });
  },

  // Platform admin events
  trackAdminAction: (action: string, targetEntity: string, targetId: string) => {
    mixpanel.track('Admin Action', {
      action,
      target_entity: targetEntity,
      target_id: targetId,
    });
  },

  trackBulkAction: (action: string, entityType: string, count: number) => {
    mixpanel.track('Bulk Action', {
      action,
      entity_type: entityType,
      count,
    });
  },

  trackDataExport: (exportType: string, format: string) => {
    mixpanel.track('Data Export', {
      export_type: exportType,
      format,
    });
  },

  // Form events
  trackFormSubmit: (formName: string, success: boolean) => {
    mixpanel.track('Form Submit', {
      form_name: formName,
      success,
    });
  },

  trackFormError: (formName: string, errorField: string) => {
    mixpanel.track('Form Error', {
      form_name: formName,
      error_field: errorField,
    });
  },

  // Search events
  trackSearch: (searchTerm: string, resultCount: number, context: string) => {
    mixpanel.track('Search', {
      search_term: searchTerm,
      result_count: resultCount,
      context,
    });
  },

  // Filter events
  trackFilter: (filterType: string, filterValue: string, context: string) => {
    mixpanel.track('Filter Applied', {
      filter_type: filterType,
      filter_value: filterValue,
      context,
    });
  },

  // Button click events
  trackButtonClick: (buttonName: string, context: string) => {
    mixpanel.track('Button Click', {
      button_name: buttonName,
      context,
    });
  },

  // Navigation events
  trackNavigation: (from: string, to: string) => {
    mixpanel.track('Navigation', {
      from_page: from,
      to_page: to,
    });
  },

  // Error events
  trackError: (errorType: string, errorMessage: string, context: string) => {
    mixpanel.track('Error Occurred', {
      error_type: errorType,
      error_message: errorMessage,
      context,
    });
  },

  // Performance events
  trackPerformance: (metric: string, value: number, context: string) => {
    mixpanel.track('Performance Metric', {
      metric,
      value,
      context,
    });
  },

  // User properties
  setUserProperties: (properties: Record<string, any>) => {
    mixpanel.people.set(properties);
  },

  incrementUserProperty: (property: string, value: number = 1) => {
    mixpanel.people.increment(property, value);
  },

  // Reset (on logout)
  reset: () => {
    mixpanel.reset();
  },
};

export default analytics;
