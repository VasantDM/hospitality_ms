from django.db import models
from django.utils import timezone

# ----------------- ROOMS & INVENTORY -----------------
class RoomCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    base_price = models.FloatField()
    capacity_adults = models.IntegerField(default=2)
    capacity_children = models.IntegerField(default=1)
    bed_type = models.CharField(max_length=50, default="King Bed")
    amenities = models.TextField(default="WiFi, AC, Smart TV, Mini Bar, Safe, Balcony")
    image_url = models.URLField(max_length=500, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Room Categories"

    def __str__(self):
        return f"{self.name} (${self.base_price}/night)"


class Room(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('reserved', 'Reserved'),
        ('out_of_order', 'Out of Order'),
    ]
    CLEAN_STATUS_CHOICES = [
        ('clean', 'Clean'),
        ('dirty', 'Dirty'),
        ('in_progress', 'In Progress'),
        ('inspected', 'Inspected'),
    ]

    room_number = models.CharField(max_length=20, unique=True, db_index=True)
    floor = models.IntegerField(default=1)
    zone = models.CharField(max_length=100, default="Main Wing")
    category = models.ForeignKey(RoomCategory, related_name="rooms", on_delete=models.CASCADE)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='available')
    clean_status = models.CharField(max_length=50, choices=CLEAN_STATUS_CHOICES, default='clean')
    keycard_code = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Room #{self.room_number} ({self.category.name})"


# ----------------- GUESTS & RESERVATIONS -----------------
class Guest(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    id_proof_type = models.CharField(max_length=50, default="Passport")
    id_proof_number = models.CharField(max_length=100, blank=True, null=True)
    nationality = models.CharField(max_length=100, default="International")
    vip_status = models.CharField(max_length=50, default="Standard")
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('checked_in', 'Checked In'),
        ('checked_out', 'Checked Out'),
        ('cancelled', 'Cancelled'),
    ]

    booking_code = models.CharField(max_length=50, unique=True, db_index=True)
    guest = models.ForeignKey(Guest, related_name="reservations", on_delete=models.CASCADE)
    source = models.CharField(max_length=50, default="direct_web")
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="confirmed")
    adults = models.IntegerField(default=2)
    children = models.IntegerField(default=0)
    special_requests = models.TextField(blank=True, null=True)
    total_estimated = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.booking_code} - {self.guest.first_name} {self.guest.last_name}"


class ReservationRoom(models.Model):
    reservation = models.ForeignKey(Reservation, related_name="reservation_rooms", on_delete=models.CASCADE)
    room = models.ForeignKey(Room, related_name="reservation_rooms", on_delete=models.CASCADE)
    rate_per_night = models.FloatField()
    actual_check_in = models.DateTimeField(blank=True, null=True)
    actual_check_out = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.reservation.booking_code} -> Room #{self.room.room_number}"


# ----------------- FOLIOS & BILLING -----------------
class Folio(models.Model):
    reservation = models.OneToOneField(Reservation, related_name="folio", on_delete=models.CASCADE, null=True, blank=True)
    guest = models.ForeignKey(Guest, related_name="folios", on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=50, default="open")  # open, settled, closed
    created_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Folio #{self.id} ({self.status})"


class FolioItem(models.Model):
    folio = models.ForeignKey(Folio, related_name="items", on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=50, default="room_charge") # room_charge, restaurant, spa, tax, discount
    amount = models.FloatField()
    quantity = models.IntegerField(default=1)
    total_amount = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} (${self.total_amount})"


class Payment(models.Model):
    folio = models.ForeignKey(Folio, related_name="payments", on_delete=models.CASCADE)
    amount = models.FloatField()
    payment_method = models.CharField(max_length=50, default="credit_card")
    transaction_ref = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment ${self.amount} via {self.payment_method}"


# ----------------- RESTAURANT & POS -----------------
class RestaurantTable(models.Model):
    table_number = models.CharField(max_length=20, unique=True)
    capacity = models.IntegerField(default=4)
    zone = models.CharField(max_length=100, default="Main Dining Hall")
    status = models.CharField(max_length=50, default="available") # available, occupied, reserved
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Table {self.table_number} ({self.zone})"


class MenuCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    display_order = models.IntegerField(default=0)
    icon = models.CharField(max_length=50, default="Utensils")

    class Meta:
        verbose_name_plural = "Menu Categories"

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    category = models.ForeignKey(MenuCategory, related_name="items", on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    price = models.FloatField()
    is_vegetarian = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    prep_time_minutes = models.IntegerField(default=15)
    image_url = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"{self.name} (${self.price})"


class RestaurantOrder(models.Model):
    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    order_type = models.CharField(max_length=50, default="dine_in")
    table = models.ForeignKey(RestaurantTable, related_name="orders", on_delete=models.SET_NULL, null=True, blank=True)
    room = models.ForeignKey(Room, related_name="orders", on_delete=models.SET_NULL, null=True, blank=True)
    folio = models.ForeignKey(Folio, related_name="restaurant_orders", on_delete=models.SET_NULL, null=True, blank=True)
    waiter_name = models.CharField(max_length=100, default="Staff")
    status = models.CharField(max_length=50, default="in_kitchen") # in_kitchen, preparing, served, paid
    subtotal = models.FloatField(default=0.0)
    tax_amount = models.FloatField(default=0.0)
    total_amount = models.FloatField(default=0.0)
    is_charged_to_room = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order_number} (${self.total_amount})"


class OrderItem(models.Model):
    order = models.ForeignKey(RestaurantOrder, related_name="items", on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, related_name="order_items", on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    unit_price = models.FloatField()
    notes = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name}"


# ----------------- HOUSEKEEPING & MAINTENANCE -----------------
class HousekeepingTask(models.Model):
    room = models.ForeignKey(Room, related_name="housekeeping_tasks", on_delete=models.CASCADE)
    assigned_to = models.CharField(max_length=100, default="Housekeeping Team")
    task_type = models.CharField(max_length=50, default="daily_service")
    priority = models.CharField(max_length=50, default="medium")
    status = models.CharField(max_length=50, default="pending") # pending, in_progress, completed, inspected
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Task #{self.id} for Room #{self.room.room_number}"


class MaintenanceRequest(models.Model):
    room = models.ForeignKey(Room, related_name="maintenance_requests", on_delete=models.CASCADE)
    reported_by = models.CharField(max_length=100, default="Front Desk")
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=50, default="hvac")
    priority = models.CharField(max_length=50, default="medium")
    status = models.CharField(max_length=50, default="open") # open, in_progress, resolved
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} (Room #{self.room.room_number})"
