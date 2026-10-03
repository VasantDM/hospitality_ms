from django.urls import path
from . import views

urlpatterns = [
    # Rooms
    path('rooms/categories', views.room_categories, name='room_categories'),
    path('rooms', views.rooms_list_create, name='rooms_list_create'),
    path('rooms/<int:pk>', views.room_detail_update, name='room_detail_update'),

    # Reservations
    path('reservations', views.reservations_list_create, name='reservations_list_create'),
    path('reservations/<int:pk>/check-in', views.check_in_reservation, name='check_in_reservation'),
    path('reservations/<int:pk>/check-out', views.check_out_reservation, name='check_out_reservation'),

    # Folios & Billing
    path('folios/<int:pk>', views.folio_detail, name='folio_detail'),
    path('folios/by-reservation/<int:res_id>', views.folio_by_reservation, name='folio_by_reservation'),
    path('folios/<int:pk>/items', views.add_folio_item, name='add_folio_item'),
    path('folios/<int:pk>/payments', views.add_folio_payment, name='add_folio_payment'),

    # Restaurant & POS
    path('restaurant/tables', views.restaurant_tables, name='restaurant_tables'),
    path('restaurant/tables/<int:pk>/status', views.update_table_status, name='update_table_status'),
    path('restaurant/categories', views.menu_categories, name='menu_categories'),
    path('restaurant/menu', views.menu_items, name='menu_items'),
    path('restaurant/orders', views.restaurant_orders, name='restaurant_orders'),
    path('restaurant/orders/<int:pk>/status', views.update_order_status, name='update_order_status'),

    # Housekeeping & Maintenance
    path('housekeeping/tasks', views.housekeeping_tasks, name='housekeeping_tasks'),
    path('housekeeping/tasks/<int:pk>', views.update_housekeeping_task, name='update_housekeeping_task'),
    path('housekeeping/maintenance', views.maintenance_requests, name='maintenance_requests'),
    path('housekeeping/maintenance/<int:pk>', views.update_maintenance_request, name='update_maintenance_request'),

    # Analytics
    path('analytics/kpis', views.kpi_summary, name='kpi_summary'),
    path('analytics/revenue-trends', views.revenue_trends, name='revenue_trends'),
]
