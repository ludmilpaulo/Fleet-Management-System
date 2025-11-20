from django.urls import path
from . import views

app_name = 'telemetry'

urlpatterns = [
    # Parking log endpoints
    path('parking-logs/', views.ParkingLogListView.as_view(), name='parking-log-list'),
    path('parking-logs/<int:id>/', views.ParkingLogDetailView.as_view(), name='parking-log-detail'),
    
    # Audit log endpoints
    path('audit-logs/', views.AuditLogListView.as_view(), name='audit-log-list'),
    path('audit-logs/<int:id>/', views.AuditLogDetailView.as_view(), name='audit-log-detail'),
    
    # Vehicle location endpoints
    path('vehicle-locations/', views.VehicleLocationListView.as_view(), name='vehicle-location-list'),
    path('vehicle-locations/<int:id>/', views.VehicleLocationDetailView.as_view(), name='vehicle-location-detail'),
    path('vehicle-locations/current/', views.VehicleLocationCurrentView.as_view(), name='vehicle-location-current'),
    path('vehicle-locations/drivers/', views.DriverLocationTrackingView.as_view(), name='driver-location-tracking'),
    
    # Statistics endpoints
    path('stats/', views.AuditLogStatsView.as_view(), name='audit-log-stats'),
]
