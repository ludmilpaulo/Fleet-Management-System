from django.urls import path
from . import views

app_name = 'fleet'

urlpatterns = [
    # Vehicle endpoints
    path('vehicles/', views.VehicleListView.as_view(), name='vehicle-list'),
    path('vehicles/<int:pk>/', views.VehicleDetailView.as_view(), name='vehicle-detail'),
    
    # Key tracker endpoints
    path('key-trackers/', views.KeyTrackerListView.as_view(), name='key-tracker-list'),
    path('key-trackers/<int:pk>/', views.KeyTrackerDetailView.as_view(), name='key-tracker-detail'),
    
    # Shift endpoints
    path('shifts/', views.ShiftListView.as_view(), name='shift-list'),
    path('shifts/<int:pk>/', views.ShiftDetailView.as_view(), name='shift-detail'),
    path('shifts/start/', views.start_shift, name='shift-start'),
    path('shifts/<int:shift_id>/end/', views.end_shift, name='shift-end'),
    
    
    # Statistics endpoints
    path('stats/vehicles/', views.vehicle_stats, name='vehicle-stats'),
    path('stats/shifts/', views.shift_stats, name='shift-stats'),
    path('stats/dashboard/', views.dashboard_stats, name='dashboard-stats'),
]
