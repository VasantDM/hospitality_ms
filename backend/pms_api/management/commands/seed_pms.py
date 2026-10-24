from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date, timedelta
from pms_api.models import (
    RoomCategory, Room,
    Guest, Reservation, ReservationRoom,
    Folio, FolioItem, Payment,
    RestaurantTable, MenuCategory, MenuItem,
    HousekeepingTask, MaintenanceRequest
)

class Command(BaseCommand):
    help = "Seed Grand Vista Resort & Hotel PMS initial luxury resort data"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Django PMS database..."))

        # 1. Superuser
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@grandvista.com", "admin123")
            self.stdout.write(self.style.SUCCESS("Created Superuser: admin / admin123"))

        # 2. Room Categories
        if not RoomCategory.objects.exists():
            categories = [
                RoomCategory(
                    name="Deluxe Ocean Suite",
                    slug="deluxe-ocean-suite",
                    description="Panoramic views of the azure coast with private sunrise balcony, jacuzzi tub, and king-size plush bedding.",
                    base_price=280.0,
                    capacity_adults=2,
                    capacity_children=1,
                    bed_type="1 King Bed",
                    amenities="Private Balcony, Ocean View, Mini-Bar, Jacuzzi, High-speed WiFi, 65' OLED TV, Espresso Machine",
                    image_url="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
                    gallery_images=[
                        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
                    ]
                ),
                RoomCategory(
                    name="Luxury Private Pool Villa",
                    slug="luxury-pool-villa",
                    description="Exclusive stand-alone sanctuary featuring a temperature-controlled plunge pool, tropical garden patio, and private butler service.",
                    base_price=550.0,
                    capacity_adults=4,
                    capacity_children=2,
                    bed_type="2 King Beds",
                    amenities="Private Plunge Pool, Butler Service, Sun Deck, Outdoor Shower, Floating Breakfast, Wine Cellar, Bose Sound System",
                    image_url="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
                    gallery_images=[
                        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                    ]
                ),
                RoomCategory(
                    name="Hilltop Garden Villa",
                    slug="hilltop-garden-villa",
                    description="Serene retreat nestled among lush botanical gardens with mountain breezes, custom teak furniture, and infinity daybeds.",
                    base_price=340.0,
                    capacity_adults=3,
                    capacity_children=1,
                    bed_type="1 King + 1 Daybed",
                    amenities="Garden View, Sun Loungers, Rain Shower, Yoga Mat, Organic Toiletries, Smart Home Climate Control",
                    image_url="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                    gallery_images=[
                        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80"
                    ]
                ),
                RoomCategory(
                    name="Executive Resort Suite",
                    slug="executive-resort-suite",
                    description="Modern sophistication tailored for leisure and business, with dedicated workstation, marble bathroom, and lounge area.",
                    base_price=220.0,
                    capacity_adults=2,
                    capacity_children=1,
                    bed_type="1 King Bed",
                    amenities="Work Desk, High-speed Fiber, Lounge Sofa, Nespresso Bar, Walk-in Closet, 24/7 In-room Dining",
                    image_url="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
                    gallery_images=[
                        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80"
                    ]
                ),
                RoomCategory(
                    name="Presidential Penthouse",
                    slug="presidential-penthouse",
                    description="The pinnacle of luxury. 3,500 sq ft top-floor suite with 360-degree vistas, private rooftop terrace, cinema room, and grand dining salon.",
                    base_price=1200.0,
                    capacity_adults=6,
                    capacity_children=3,
                    bed_type="3 King Suites",
                    amenities="Rooftop Terrace, Private Elevator, Dedicated Chef & Butler, Cinema Room, Sauna, Grand Piano",
                    image_url="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
                    gallery_images=[
                        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80"
                    ]
                ),
            ]
            RoomCategory.objects.bulk_create(categories)
            self.stdout.write(self.style.SUCCESS("Created Room Categories"))

        # 3. Rooms
        if not Room.objects.exists():
            cats = {c.slug: c for c in RoomCategory.objects.all()}
            rooms = [
                # Beachfront Wing
                Room(room_number="101", floor=1, zone="Beachfront Wing", category=cats["deluxe-ocean-suite"], status="available", clean_status="clean"),
                Room(room_number="102", floor=1, zone="Beachfront Wing", category=cats["deluxe-ocean-suite"], status="occupied", clean_status="clean"),
                Room(room_number="103", floor=1, zone="Beachfront Wing", category=cats["deluxe-ocean-suite"], status="available", clean_status="dirty"),
                Room(room_number="201", floor=2, zone="Beachfront Wing", category=cats["deluxe-ocean-suite"], status="occupied", clean_status="clean"),
                Room(room_number="202", floor=2, zone="Beachfront Wing", category=cats["deluxe-ocean-suite"], status="available", clean_status="clean"),

                # Hilltop Sanctuary
                Room(room_number="V-01", floor=1, zone="Hilltop Villas", category=cats["luxury-pool-villa"], status="occupied", clean_status="clean"),
                Room(room_number="V-02", floor=1, zone="Hilltop Villas", category=cats["luxury-pool-villa"], status="available", clean_status="clean"),
                Room(room_number="V-03", floor=1, zone="Hilltop Villas", category=cats["luxury-pool-villa"], status="out_of_order", clean_status="in_progress"),
                Room(room_number="G-01", floor=1, zone="Hilltop Villas", category=cats["hilltop-garden-villa"], status="available", clean_status="clean"),
                Room(room_number="G-02", floor=1, zone="Hilltop Villas", category=cats["hilltop-garden-villa"], status="occupied", clean_status="clean"),

                # Main Resort Wing
                Room(room_number="301", floor=3, zone="Main Resort Wing", category=cats["executive-resort-suite"], status="available", clean_status="clean"),
                Room(room_number="302", floor=3, zone="Main Resort Wing", category=cats["executive-resort-suite"], status="available", clean_status="clean"),
                Room(room_number="303", floor=3, zone="Main Resort Wing", category=cats["executive-resort-suite"], status="occupied", clean_status="clean"),
                Room(room_number="401", floor=4, zone="Main Resort Wing", category=cats["executive-resort-suite"], status="available", clean_status="inspected"),

                # Penthouse
                Room(room_number="PH-01", floor=5, zone="Skyline Tower", category=cats["presidential-penthouse"], status="occupied", clean_status="clean"),
            ]
            Room.objects.bulk_create(rooms)
            self.stdout.write(self.style.SUCCESS("Created Room Units"))

        # 4. Tables
        if not RestaurantTable.objects.exists():
            tables = [
                RestaurantTable(table_number="T-01", capacity=2, zone="Main Dining Hall", status="occupied"),
                RestaurantTable(table_number="T-02", capacity=4, zone="Main Dining Hall", status="available"),
                RestaurantTable(table_number="T-03", capacity=6, zone="Main Dining Hall", status="available"),
                RestaurantTable(table_number="P-01", capacity=4, zone="Poolside Terrace", status="occupied"),
                RestaurantTable(table_number="P-02", capacity=4, zone="Poolside Terrace", status="available"),
                RestaurantTable(table_number="R-01", capacity=2, zone="Rooftop Sunset Lounge", status="available"),
                RestaurantTable(table_number="R-02", capacity=4, zone="Rooftop Sunset Lounge", status="occupied"),
                RestaurantTable(table_number="BAR-01", capacity=2, zone="Sunset Cocktail Bar", status="available"),
            ]
            RestaurantTable.objects.bulk_create(tables)
            self.stdout.write(self.style.SUCCESS("Created Dining Tables"))

        # 5. Menu Categories & Items
        if not MenuCategory.objects.exists():
            m_cats = [
                MenuCategory(name="Appetizers & Tapas", display_order=1, icon="UtensilsCrossed"),
                MenuCategory(name="Gourmet Entrées", display_order=2, icon="Soup"),
                MenuCategory(name="Wood-Fired Pizzas & Pasta", display_order=3, icon="Pizza"),
                MenuCategory(name="Signature Cocktails & Mocktails", display_order=4, icon="Wine"),
                MenuCategory(name="Artisan Desserts", display_order=5, icon="Cake"),
            ]
            for mc in m_cats:
                mc.save()

            cat_map = {c.name: c for c in MenuCategory.objects.all()}
            menu_items = [
                MenuItem(category=cat_map["Appetizers & Tapas"], name="Crispy Truffle Calamari", description="Wild caught calamari tossed with black truffle aioli and lemon zest.", price=18.5, is_vegetarian=False, prep_time_minutes=12),
                MenuItem(category=cat_map["Appetizers & Tapas"], name="Burrata Caprese Royale", description="Artisanal Pugliese burrata, heirloom tomatoes, basil foam, aged balsamico.", price=21.0, is_vegetarian=True, prep_time_minutes=10),
                MenuItem(category=cat_map["Gourmet Entrées"], name="Pan-Seared Chilean Sea Bass", description="Served over saffron risotto with charred asparagus and lemon beurre blanc.", price=46.0, is_vegetarian=False, prep_time_minutes=25),
                MenuItem(category=cat_map["Gourmet Entrées"], name="Prime Angus Ribeye (12oz)", description="Charred to perfection, truffle herb butter, roasted garlic pomme puree.", price=54.0, is_vegetarian=False, prep_time_minutes=22),
                MenuItem(category=cat_map["Gourmet Entrées"], name="Wild Morel Mushroom Risotto", description="Arborio rice, aged parmesan reggiano, white truffle emulsion.", price=32.0, is_vegetarian=True, prep_time_minutes=18),
                MenuItem(category=cat_map["Wood-Fired Pizzas & Pasta"], name="Black Truffle & Prosciutto Pizza", description="Fior di latte mozzarella, 24-month prosciutto di Parma, shaved black truffle.", price=28.0, is_vegetarian=False, prep_time_minutes=15),
                MenuItem(category=cat_map["Wood-Fired Pizzas & Pasta"], name="Handmade Lobster Ravioli", description="Lobster bisque reduction, cherry tomato confit, fresh tarragon.", price=38.0, is_vegetarian=False, prep_time_minutes=20),
                MenuItem(category=cat_map["Signature Cocktails & Mocktails"], name="Smoked Rosemary Old Fashioned", description="Small batch bourbon, angostura, flamed orange peel, smoked rosemary.", price=19.0, is_vegetarian=True, prep_time_minutes=5),
                MenuItem(category=cat_map["Signature Cocktails & Mocktails"], name="Azure Coast Passionfruit Spritz", description="Prosecco, fresh passionfruit pulp, elderflower liqueur, mint spray.", price=16.5, is_vegetarian=True, prep_time_minutes=5),
                MenuItem(category=cat_map["Artisan Desserts"], name="Valrhona Lava Soufflé", description="Warm 70% dark chocolate center, Tahitian vanilla bean gelato.", price=16.0, is_vegetarian=True, prep_time_minutes=15),
            ]
            MenuItem.objects.bulk_create(menu_items)
            self.stdout.write(self.style.SUCCESS("Created Menu Items"))

        # 6. Guest, Reservation & Folio
        if not Reservation.objects.exists():
            today = date.today()
            guest1 = Guest.objects.create(
                first_name="Victoria",
                last_name="Sterling",
                email="v.sterling@luxuryvoyage.com",
                phone="+1 (415) 892-3301",
                id_proof_type="Passport",
                id_proof_number="US98320491",
                nationality="United States",
                vip_status="VIP Platinum",
                notes="Prefers sparkling mineral water on arrival and allergen-free pillows."
            )

            res1 = Reservation.objects.create(
                booking_code="GV-882941",
                guest=guest1,
                source="direct_web",
                check_in_date=today - timedelta(days=1),
                check_out_date=today + timedelta(days=3),
                status="checked_in",
                adults=2,
                children=0,
                special_requests="High floor with unobstructed sunrise view",
                total_estimated=1120.0
            )

            room102 = Room.objects.get(room_number="102")
            ReservationRoom.objects.create(
                reservation=res1,
                room=room102,
                rate_per_night=280.0,
                actual_check_in=timezone.now() - timedelta(days=1)
            )

            folio1 = Folio.objects.create(reservation=res1, guest=guest1, status="open")
            FolioItem.objects.create(folio=folio1, description="Deluxe Ocean Suite (4 Nights @ $280)", category="room_charge", amount=1120.0, quantity=1, total_amount=1120.0)
            FolioItem.objects.create(folio=folio1, description="Resort Occupancy Tax & Service (12%)", category="tax", amount=134.4, quantity=1, total_amount=134.4)
            FolioItem.objects.create(folio=folio1, description="Sunset Terrace Dining: Chilean Sea Bass & Wine", category="restaurant", amount=84.5, quantity=1, total_amount=84.5)
            Payment.objects.create(folio=folio1, amount=600.0, payment_method="credit_card", transaction_ref="TXN-VISA-9921", notes="Advance deposit at check-in")

            # Housekeeping and Maintenance
            room103 = Room.objects.get(room_number="103")
            HousekeepingTask.objects.create(
                room=room103,
                assigned_to="Elena Rodriguez",
                task_type="post_checkout",
                priority="high",
                status="pending",
                notes="Guest checked out at 11:00 AM. Deep clean and replenish organic amenities."
            )

            roomV03 = Room.objects.get(room_number="V-03")
            MaintenanceRequest.objects.create(
                room=roomV03,
                reported_by="Front Desk",
                title="Plunge pool heating thermostat sensor error",
                category="plumbing",
                priority="high",
                status="in_progress",
                notes="Engineering team inspecting the digital heat pump sensor."
            )

            self.stdout.write(self.style.SUCCESS("Created Sample Reservations, Folios & Maintenance tickets"))

        self.stdout.write(self.style.SUCCESS("Django PMS Database successfully initialized!"))
