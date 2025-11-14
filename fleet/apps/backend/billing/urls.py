from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlanViewSet, CompanySubscriptionViewSet, PaymentViewSet,
    CheckoutSessionView, webhook_handler
)

router = DefaultRouter()
router.register(r'plans', PlanViewSet, basename='plan')
router.register(r'subscriptions', CompanySubscriptionViewSet, basename='subscription')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('checkout-session/', CheckoutSessionView.as_view(), name='checkout-session'),
    path('webhooks/<str:provider_name>/', webhook_handler, name='webhook-handler'),
]

