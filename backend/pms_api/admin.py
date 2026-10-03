from django.contrib import admin
from .models import (
    RoomCategory, Room,
    Guest, Reservation, ReservationRoom,
    Folio, FolioItem, Payment,
    RestaurantTable, MenuCategory, MenuItem, RestaurantOrder, OrderItem,
    HousekeepingTask, MaintenanceRequest
)

class RoomInline(admin.TabularInline):
    model = Room
    extra = 0

@admin.register(RoomCategory)
class RoomCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'base_price', 'capacity_adults', 'bed_type')
    search_fields = ('name', 'amenities')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [RoomInline]

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'category', 'floor', 'zone', 'status', 'clean_status', 'is_active')
    list_filter = ('status', 'clean_status', 'zone', 'floor', 'category')
    search_fields = ('room_number', 'keycard_code')
    list_editable = ('status', 'clean_status')

class ReservationRoomInline(admin.TabularInline):
    model = ReservationRoom
    extra = 0

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('booking_code', 'guest', 'check_in_date', 'check_out_date', 'status', 'total_estimated')
    list_filter = ('status', 'source', 'check_in_date')
    search_fields = ('booking_code', 'guest__first_name', 'guest__last_name', 'guest__email')
    inlines = [ReservationRoomInline]

@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'phone', 'vip_status', 'nationality')
    search_fields = ('first_name', 'last_name', 'email', 'id_proof_number')
    list_filter = ('vip_status', 'nationality')

class FolioItemInline(admin.TabularInline):
    model = FolioItem
    extra = 0

class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0

@admin.register(Folio)
class FolioAdmin(admin.ModelAdmin):
    list_display = ('id', 'reservation', 'guest', 'status', 'created_at')
    list_filter = ('status',)
    inlines = [FolioItemInline, PaymentInline]

@admin.register(RestaurantTable)
class RestaurantTableAdmin(admin.ModelAdmin):
    list_display = ('table_number', 'zone', 'capacity', 'status', 'is_active')
    list_filter = ('zone', 'status')
    list_editable = ('status',)

class MenuItemInline(admin.TabularInline):
    model = MenuItem
    extra = 0

@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_order', 'icon')
    inlines = [MenuItemInline]

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'is_vegetarian', 'is_available')
    list_filter = ('category', 'is_vegetarian', 'is_available')
    search_fields = ('name', 'description')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(RestaurantOrder)
class RestaurantOrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'order_type', 'table', 'room', 'status', 'total_amount', 'is_charged_to_room')
    list_filter = ('order_type', 'status', 'is_charged_to_room')
    inlines = [OrderItemInline]

@admin.register(HousekeepingTask)
class HousekeepingTaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'task_type', 'priority', 'status', 'assigned_to', 'created_at')
    list_filter = ('status', 'priority', 'task_type')
    list_editable = ('status', 'priority')

@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'title', 'category', 'priority', 'status', 'created_at')
    list_filter = ('status', 'priority', 'category')
    list_editable = ('status',)
