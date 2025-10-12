from django.urls import path
from . import views

app_name = 'inspections'

urlpatterns = [
    # Inspection endpoints
    path('inspections/', views.InspectionListView.as_view(), name='inspection-list'),
    path('inspections/<int:pk>/', views.InspectionDetailView.as_view(), name='inspection-detail'),
    path('inspections/<int:pk>/complete/', views.InspectionCompleteView.as_view(), name='inspection-complete'),
    
    # Inspection item endpoints
    path('inspection-items/', views.InspectionItemListView.as_view(), name='inspection-item-list'),
    path('inspection-items/<int:pk>/', views.InspectionItemDetailView.as_view(), name='inspection-item-detail'),
    
    # Photo endpoints
    path('photos/', views.PhotoListView.as_view(), name='photo-list'),
    path('photos/<int:pk>/', views.PhotoDetailView.as_view(), name='photo-detail'),
    path('photos/confirm/', views.PhotoConfirmView.as_view(), name='photo-confirm'),
    
    # Template endpoints
    path('templates/', views.InspectionTemplateListView.as_view(), name='template-list'),
    path('templates/<int:pk>/', views.InspectionTemplateDetailView.as_view(), name='template-detail'),
    
    # Statistics endpoints
    path('stats/', views.InspectionStatsView.as_view(), name='inspection-stats'),
]
