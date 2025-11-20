from django.urls import path
from . import company_views

app_name = 'company'

urlpatterns = [
    # Public company endpoints
    # IMPORTANT: More specific paths must come before parameterized paths
    path('companies/create-public/', company_views.PublicCompanyCreateView.as_view(), name='company_create_public'),
    path('companies/exists/', company_views.company_exists_view, name='company_exists'),
    path('companies/stats/', company_views.company_stats_view, name='company_stats'),
    path('companies/<slug:slug>/', company_views.CompanyDetailView.as_view(), name='company_detail'),
    path('companies/', company_views.CompanyListView.as_view(), name='company_list'),
    
    # Company management endpoints (authenticated)
    path('companies/create/', company_views.CompanyCreateView.as_view(), name='company_create'),
    path('companies/<int:pk>/update/', company_views.CompanyUpdateView.as_view(), name='company_update'),
]
