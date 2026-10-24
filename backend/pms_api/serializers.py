from rest_framework import serializers
from .models import (
    RoomCategory, Room,
    Guest, Reservation, ReservationRoom,
    Folio, FolioItem, Payment,
    RestaurantTable, MenuCategory, MenuItem, RestaurantOrder, OrderItem,
    HousekeepingTask, MaintenanceRequest
)

class RoomCategorySerializer(serializers.ModelSerializer):
    all_images = serializers.SerializerMethodField()

    class Meta:
        model = RoomCategory
        fields = '__all__'

    def get_all_images(self, obj):
        imgs = []
        if obj.image_url:
            imgs.append(obj.image_url)
        if isinstance(obj.gallery_images, list):
            for img in obj.gallery_images:
                if img and img not in imgs:
                    imgs.append(img)
        return imgs

class RoomSerializer(serializers.ModelSerializer):
    category = RoomCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=RoomCategory.objects.all(), source='category', write_only=True
    )

    class Meta:
        model = Room
        fields = '__all__'

class GuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = '__all__'

class ReservationRoomSerializer(serializers.ModelSerializer):
    room = RoomSerializer(read_only=True)

    class Meta:
        model = ReservationRoom
        fields = '__all__'

class ReservationSerializer(serializers.ModelSerializer):
    guest = GuestSerializer(read_only=True)
    reservation_rooms = ReservationRoomSerializer(many=True, read_only=True)

    class Meta:
        model = Reservation
        fields = '__all__'

class FolioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FolioItem
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class FolioSerializer(serializers.ModelSerializer):
    items = FolioItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    total_charges = serializers.SerializerMethodField()
    total_payments = serializers.SerializerMethodField()
    balance_due = serializers.SerializerMethodField()

    class Meta:
        model = Folio
        fields = '__all__'

    def get_total_charges(self, obj):
        return round(sum(i.total_amount for i in obj.items.all()), 2)

    def get_total_payments(self, obj):
        return round(sum(p.amount for p in obj.payments.all()), 2)

    def get_balance_due(self, obj):
        charges = sum(i.total_amount for i in obj.items.all())
        payments = sum(p.amount for p in obj.payments.all())
        return round(charges - payments, 2)

class RestaurantTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantTable
        fields = '__all__'

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class MenuCategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = MenuCategory
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = '__all__'

class RestaurantOrderSerializer(serializers.ModelSerializer):
    table = RestaurantTableSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = RestaurantOrder
        fields = '__all__'

class HousekeepingTaskSerializer(serializers.ModelSerializer):
    room = RoomSerializer(read_only=True)

    class Meta:
        model = HousekeepingTask
        fields = '__all__'

class MaintenanceRequestSerializer(serializers.ModelSerializer):
    room = RoomSerializer(read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = '__all__'
