from django.urls import path
from . import company_views

app_name = 'company'

urlpatterns = [
    # Public company endpoints
    path('companies/', company_views.CompanyListView.as_view(), name='company_list'),
    path('companies/<slug:slug>/', company_views.CompanyDetailView.as_view(), name='company_detail'),
    path('companies/exists/', company_views.company_exists_view, name='company_exists'),
    
    # Company management endpoints (authenticated)
    path('companies/create/', company_views.CompanyCreateView.as_view(), name='company_create'),
    path('companies/<int:pk>/update/', company_views.CompanyUpdateView.as_view(), name='company_update'),
    path('companies/stats/', company_views.company_stats_view, name='company_stats'),
]
