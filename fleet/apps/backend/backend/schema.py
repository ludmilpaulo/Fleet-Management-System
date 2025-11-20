import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

from account.models import User as AccountUser
from fleet_app.models import Vehicle


def get_user_from_context(info):
    """
    Simple token-based authentication for GraphQL resolvers.
    Expects `Authorization: Token <key>` header (same as DRF).
    """
    request = info.context
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header.startswith("Token "):
        key = auth_header.split(" ", 1)[1].strip()
        try:
            token = Token.objects.get(key=key)
            return token.user
        except Token.DoesNotExist:
            return None
    if request.user and request.user.is_authenticated:
        return request.user
    return None


class UserType(DjangoObjectType):
    class Meta:
        model = get_user_model()
        fields = ("id", "email", "first_name", "last_name", "role", "company")


class VehicleType(DjangoObjectType):
    class Meta:
        model = Vehicle
        fields = "__all__"


class Query(graphene.ObjectType):
    me = graphene.Field(UserType)
    vehicles = graphene.List(VehicleType, search=graphene.String(required=False))
    vehicle = graphene.Field(VehicleType, id=graphene.ID(required=True))

    def resolve_me(root, info):
        user = get_user_from_context(info)
        return user

    def resolve_vehicles(root, info, search=None):
        user = get_user_from_context(info)
        qs = Vehicle.objects.all()
        # If user belongs to a company, scope to that org (matches REST behaviour)
        if getattr(user, "company", None):
            qs = qs.filter(org=user.company)
        if search:
            qs = qs.filter(reg_number__icontains=search)
        return qs.order_by("reg_number")

    def resolve_vehicle(root, info, id):
        user = get_user_from_context(info)
        qs = Vehicle.objects.all()
        if getattr(user, "company", None):
            qs = qs.filter(org=user.company)
        return qs.get(pk=id)


class CreateVehicle(graphene.Mutation):
    class Arguments:
        reg_number = graphene.String(required=True)
        make = graphene.String(required=False)
        model = graphene.String(required=False)
        year = graphene.Int(required=False)
        # Additional fields can be added here as needed

    vehicle = graphene.Field(VehicleType)

    @classmethod
    def mutate(cls, root, info, reg_number, make=None, model=None, year=None):
        user = get_user_from_context(info)
        if not user or not getattr(user, "company", None):
            raise Exception("Authentication required and user must belong to a company.")

        vehicle = Vehicle.objects.create(
            org=user.company,
            reg_number=reg_number,
            make=make or "",
            model=model or "",
            year=year,
            created_by=user,
        )
        return CreateVehicle(vehicle=vehicle)


class UpdateVehicle(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        reg_number = graphene.String(required=False)
        make = graphene.String(required=False)
        model = graphene.String(required=False)
        year = graphene.Int(required=False)

    vehicle = graphene.Field(VehicleType)

    @classmethod
    def mutate(cls, root, info, id, reg_number=None, make=None, model=None, year=None):
        user = get_user_from_context(info)
        if not user:
            raise Exception("Authentication required.")

        qs = Vehicle.objects.all()
        if getattr(user, "company", None):
            qs = qs.filter(org=user.company)

        vehicle = qs.get(pk=id)

        if reg_number is not None:
            vehicle.reg_number = reg_number
        if make is not None:
            vehicle.make = make
        if model is not None:
            vehicle.model = model
        if year is not None:
            vehicle.year = year

        vehicle.save()
        return UpdateVehicle(vehicle=vehicle)


class DeleteVehicle(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    ok = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, id):
        user = get_user_from_context(info)
        if not user:
            raise Exception("Authentication required.")

        qs = Vehicle.objects.all()
        if getattr(user, "company", None):
            qs = qs.filter(org=user.company)

        vehicle = qs.get(pk=id)
        vehicle.delete()
        return DeleteVehicle(ok=True)


class Mutation(graphene.ObjectType):
    create_vehicle = CreateVehicle.Field()
    update_vehicle = UpdateVehicle.Field()
    delete_vehicle = DeleteVehicle.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)


