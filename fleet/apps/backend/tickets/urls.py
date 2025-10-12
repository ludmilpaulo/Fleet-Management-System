from django.urls import path
from . import views

app_name = 'tickets'

urlpatterns = [
    # Ticket endpoints
    path('tickets/', views.TicketListView.as_view(), name='ticket-list'),
    path('tickets/<int:id>/', views.TicketDetailView.as_view(), name='ticket-detail'),
    
    # Statistics endpoints
    path('stats/', views.TicketStatsView.as_view(), name='ticket-stats'),
]
