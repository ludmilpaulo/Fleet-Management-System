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
    
    # Statistics endpoints
    path('stats/', views.AuditLogStatsView.as_view(), name='audit-log-stats'),
]
