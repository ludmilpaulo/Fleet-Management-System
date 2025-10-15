// Analytics service - simplified version without external dependencies
// This can be extended with actual analytics providers later

export const analytics = {
  // User events
  identify: (userId: string, properties?: Record<string, any>) => {
    console.log('Analytics: identify', userId, properties);
  },

  track: (eventName: string, properties?: Record<string, any>) => {
    console.log('Analytics: track', eventName, properties);
  },

  // Authentication events
  trackSignup: (userId: string, role: string, company: string) => {
    console.log('Analytics: trackSignup', { userId, role, company });
  },

  trackLogin: (userId: string, role: string, company: string) => {
    console.log('Analytics: trackLogin', { userId, role, company });
  },

  trackLogout: (userId: string) => {
    console.log('Analytics: trackLogout', { userId });
  },

  // Page view events
  trackPageView: (pageName: string, properties?: Record<string, any>) => {
    console.log('Analytics: trackPageView', { pageName, properties });
  },

  // Dashboard events
  trackDashboardView: (dashboardType: string, userId: string, company: string) => {
    console.log('Analytics: trackDashboardView', { dashboardType, userId, company });
  },

  // Vehicle events
  trackVehicleCreate: (vehicleId: string, make: string, model: string) => {
    console.log('Analytics: trackVehicleCreate', { vehicleId, make, model });
  },

  trackVehicleUpdate: (vehicleId: string, changes: Record<string, any>) => {
    console.log('Analytics: trackVehicleUpdate', { vehicleId, changes });
  },

  trackVehicleDelete: (vehicleId: string) => {
    console.log('Analytics: trackVehicleDelete', { vehicleId });
  },

  // Shift events
  trackShiftStart: (shiftId: string, vehicleId: string, driverId: string) => {
    console.log('Analytics: trackShiftStart', { shiftId, vehicleId, driverId });
  },

  trackShiftEnd: (shiftId: string, duration: number, distance: number) => {
    console.log('Analytics: trackShiftEnd', { shiftId, duration, distance });
  },

  // Inspection events
  trackInspectionCreate: (inspectionId: string, vehicleId: string) => {
    console.log('Analytics: trackInspectionCreate', { inspectionId, vehicleId });
  },

  trackInspectionComplete: (inspectionId: string, status: string, itemsChecked: number) => {
    console.log('Analytics: trackInspectionComplete', { inspectionId, status, itemsChecked });
  },

  trackPhotoCapture: (context: string, photoCount: number) => {
    console.log('Analytics: trackPhotoCapture', { context, photoCount });
  },

  // Issue events
  trackIssueCreate: (issueId: string, priority: string, vehicleId: string) => {
    console.log('Analytics: trackIssueCreate', { issueId, priority, vehicleId });
  },

  trackIssueAssign: (issueId: string, assignedTo: string) => {
    console.log('Analytics: trackIssueAssign', { issueId, assignedTo });
  },

  trackIssueResolve: (issueId: string, resolutionTime: number) => {
    console.log('Analytics: trackIssueResolve', { issueId, resolutionTime });
  },

  // Subscription events
  trackSubscriptionView: (currentPlan: string, trialDaysRemaining: number) => {
    console.log('Analytics: trackSubscriptionView', { currentPlan, trialDaysRemaining });
  },

  trackPlanUpgrade: (fromPlan: string, toPlan: string, billingCycle: string) => {
    console.log('Analytics: trackPlanUpgrade', { fromPlan, toPlan, billingCycle });
  },

  trackTrialExpiring: (daysRemaining: number, company: string) => {
    console.log('Analytics: trackTrialExpiring', { daysRemaining, company });
  },

  // Platform admin events
  trackAdminAction: (action: string, targetEntity: string, targetId: string) => {
    console.log('Analytics: trackAdminAction', { action, targetEntity, targetId });
  },

  trackBulkAction: (action: string, entityType: string, count: number) => {
    console.log('Analytics: trackBulkAction', { action, entityType, count });
  },

  trackDataExport: (exportType: string, format: string) => {
    console.log('Analytics: trackDataExport', { exportType, format });
  },

  // Search events
  trackSearch: (searchTerm: string, resultCount: number, context: string) => {
    console.log('Analytics: trackSearch', { searchTerm, resultCount, context });
  },

  // Filter events
  trackFilter: (filterType: string, filterValue: string, context: string) => {
    console.log('Analytics: trackFilter', { filterType, filterValue, context });
  },

  // Form events
  trackFormSubmit: (formName: string, success: boolean) => {
    console.log('Analytics: trackFormSubmit', { formName, success });
  },

  trackFormError: (formName: string, errorField: string) => {
    console.log('Analytics: trackFormError', { formName, errorField });
  },

  // Button click events
  trackButtonClick: (buttonName: string, context: string) => {
    console.log('Analytics: trackButtonClick', { buttonName, context });
  },

  // Navigation events
  trackNavigation: (from: string, to: string) => {
    console.log('Analytics: trackNavigation', { from, to });
  },

  // Error events
  trackError: (errorType: string, errorMessage: string, context: string) => {
    console.log('Analytics: trackError', { errorType, errorMessage, context });
  },

  // Performance events
  trackPerformance: (metric: string, value: number, context: string) => {
    console.log('Analytics: trackPerformance', { metric, value, context });
  },

  // User properties
  setUserProperties: (properties: Record<string, any>) => {
    console.log('Analytics: setUserProperties', properties);
  },

  incrementUserProperty: (property: string, value: number = 1) => {
    console.log('Analytics: incrementUserProperty', { property, value });
  },

  // Reset (on logout)
  reset: () => {
    console.log('Analytics: reset');
  },
};

export default analytics;