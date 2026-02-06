from django.urls import path
from . import views

app_name = 'account'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('forgot-password/', views.forgot_password_view, name='forgot_password'),
    
    # User profile endpoints
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('change-password/', views.change_password_view, name='change_password'),
    
    # User management endpoints
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
    
    # Statistics endpoint (admin only)
    path('stats/', views.user_stats_view, name='user_stats'),

    # Public landing page stats (no auth required)
    path('landing-stats/', views.landing_stats_view, name='landing_stats'),
]
