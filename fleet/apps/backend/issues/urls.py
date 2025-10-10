from django.urls import path
from . import views

app_name = 'issues'

urlpatterns = [
    # Issue endpoints
    path('issues/', views.IssueListView.as_view(), name='issue-list'),
    path('issues/<int:id>/', views.IssueDetailView.as_view(), name='issue-detail'),
    
    # Statistics endpoints
    path('stats/', views.IssueStatsView.as_view(), name='issue-stats'),
]
