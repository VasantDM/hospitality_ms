from rest_framework import status, viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import date, datetime, timedelta
import random
import string

from .models import (
    RoomCategory, Room,
    Guest, Reservation, ReservationRoom,
    Folio, FolioItem, Payment,
    RestaurantTable, MenuCategory, MenuItem, RestaurantOrder, OrderItem,
    HousekeepingTask, MaintenanceRequest
)
from .serializers import (
    RoomCategorySerializer, RoomSerializer,
    GuestSerializer, ReservationSerializer,
    FolioSerializer, FolioItemSerializer, PaymentSerializer,
    RestaurantTableSerializer, MenuCategorySerializer, MenuItemSerializer,
    RestaurantOrderSerializer,
    HousekeepingTaskSerializer, MaintenanceRequestSerializer
)

def generate_booking_code():
    chars = string.ascii_uppercase + string.digits
    suffix = ''.join(random.choices(chars, k=6))
    return f"GV-{suffix}"

def generate_order_number():
    chars = string.digits
    suffix = ''.join(random.choices(chars, k=5))
    return f"ORD-{suffix}"

# ----------------- ROOMS -----------------
@api_view(['GET', 'POST'])
def room_categories(request):
    if request.method == 'GET':
        cats = RoomCategory.objects.all()
        return Response(RoomCategorySerializer(cats, many=True).data)
    elif request.method == 'POST':
        serializer = RoomCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def rooms_list_create(request):
    if request.method == 'GET':
        qs = Room.objects.all()
        zone = request.query_params.get('zone')
        stat = request.query_params.get('status')
        clean_stat = request.query_params.get('clean_status')
        cat_id = request.query_params.get('category_id')

        if zone: qs = qs.filter(zone=zone)
        if stat: qs = qs.filter(status=stat)
        if clean_stat: qs = qs.filter(clean_status=clean_stat)
        if cat_id: qs = qs.filter(category_id=cat_id)

        return Response(RoomSerializer(qs.order_by('room_number'), many=True).data)
    elif request.method == 'POST':
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH'])
def room_detail_update(request, pk):
    try:
        room = Room.objects.get(pk=pk)
    except Room.DoesNotExist:
        return Response({'detail': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(RoomSerializer(room).data)
    elif request.method == 'PATCH':
        serializer = RoomSerializer(room, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----------------- RESERVATIONS -----------------
@api_view(['GET', 'POST'])
def reservations_list_create(request):
    if request.method == 'GET':
        qs = Reservation.objects.all()
        stat = request.query_params.get('status')
        search = request.query_params.get('search')
        if stat: qs = qs.filter(status=stat)
        if search:
            qs = qs.filter(
                Q(booking_code__icontains=search) |
                Q(guest__first_name__icontains=search) |
                Q(guest__last_name__icontains=search) |
                Q(guest__email__icontains=search)
            )
        return Response(ReservationSerializer(qs.order_by('-check_in_date'), many=True).data)

    elif request.method == 'POST':
        data = request.data
        guest_data = data.get('guest', {})
        room_ids = data.get('room_ids', [])
        check_in = data.get('check_in_date')
        check_out = data.get('check_out_date')

        if not check_in or not check_out or check_in >= check_out:
            return Response({'detail': 'Valid check-in and check-out dates are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create Guest
        email = guest_data.get('email')
        guest, _ = Guest.objects.get_or_create(email=email, defaults=guest_data)

        # Validate rooms and prevent overlap
        d_in = datetime.strptime(str(check_in), "%Y-%m-%d").date()
        d_out = datetime.strptime(str(check_out), "%Y-%m-%d").date()
        num_nights = max(1, (d_out - d_in).days)
        total_est = 0.0
        allocated_rooms = []

        for rid in room_ids:
            try:
                room = Room.objects.get(pk=rid)
            except Room.DoesNotExist:
                return Response({'detail': f'Room ID {rid} not found'}, status=status.HTTP_400_BAD_REQUEST)

            # Check overlap
            overlapping = ReservationRoom.objects.filter(
                room_id=rid,
                reservation__status__in=['confirmed', 'checked_in'],
                reservation__check_in_date__lt=d_out,
                reservation__check_out_date__gt=d_in
            ).exists()

            if overlapping:
                return Response({'detail': f'Room {room.room_number} is already booked for the selected dates.'}, status=status.HTTP_400_BAD_REQUEST)

            rate = room.category.base_price if room.category else 150.0
            total_est += rate * num_nights
            allocated_rooms.append((room, rate))

        # Create Reservation
        res = Reservation.objects.create(
            booking_code=generate_booking_code(),
            guest=guest,
            source=data.get('source', 'direct_web'),
            check_in_date=d_in,
            check_out_date=d_out,
            status='confirmed',
            adults=data.get('adults', 2),
            children=data.get('children', 0),
            special_requests=data.get('special_requests', ''),
            total_estimated=total_est
        )

        # Create Folio
        folio = Folio.objects.create(reservation=res, guest=guest, status='open')

        for room, rate in allocated_rooms:
            ReservationRoom.objects.create(
                reservation=res,
                room=room,
                rate_per_night=rate
            )
            FolioItem.objects.create(
                folio=folio,
                description=f"Room Charge: #{room.room_number} ({room.category.name}) - {num_nights} Night(s)",
                category="room_charge",
                amount=rate * num_nights,
                quantity=1,
                total_amount=rate * num_nights
            )

        tax_amt = round(total_est * 0.12, 2)
        FolioItem.objects.create(
            folio=folio,
            description="Resort Occupancy Tax & Service (12%)",
            category="tax",
            amount=tax_amt,
            quantity=1,
            total_amount=tax_amt
        )

        return Response(ReservationSerializer(res).data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def check_in_reservation(request, pk):
    try:
        res = Reservation.objects.get(pk=pk)
    except Reservation.DoesNotExist:
        return Response({'detail': 'Reservation not found'}, status=status.HTTP_404_NOT_FOUND)

    res.status = 'checked_in'
    res.save()

    for rr in res.reservation_rooms.all():
        rr.actual_check_in = timezone.now()
        rr.save()
        if rr.room:
            rr.room.status = 'occupied'
            rr.room.clean_status = 'clean'
            rr.room.save()

    return Response(ReservationSerializer(res).data)

@api_view(['POST'])
def check_out_reservation(request, pk):
    try:
        res = Reservation.objects.get(pk=pk)
    except Reservation.DoesNotExist:
        return Response({'detail': 'Reservation not found'}, status=status.HTTP_404_NOT_FOUND)

    res.status = 'checked_out'
    res.save()

    for rr in res.reservation_rooms.all():
        rr.actual_check_out = timezone.now()
        rr.save()
        if rr.room:
            rr.room.status = 'available'
            rr.room.clean_status = 'dirty'
            rr.room.save()

            # Auto create housekeeping task
            HousekeepingTask.objects.create(
                room=rr.room,
                task_type="post_checkout",
                priority="high",
                status="pending",
                notes=f"Express checkout clean for Room #{rr.room.room_number}"
            )

    if hasattr(res, 'folio') and res.folio:
        res.folio.status = 'settled'
        res.folio.closed_at = timezone.now()
        res.folio.save()

    return Response(ReservationSerializer(res).data)


# ----------------- FOLIOS & BILLING -----------------
@api_view(['GET'])
def folio_detail(request, pk):
    try:
        folio = Folio.objects.get(pk=pk)
    except Folio.DoesNotExist:
        return Response({'detail': 'Folio not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(FolioSerializer(folio).data)

@api_view(['GET'])
def folio_by_reservation(request, res_id):
    try:
        folio = Folio.objects.get(reservation_id=res_id)
    except Folio.DoesNotExist:
        return Response({'detail': 'Folio not found for reservation'}, status=status.HTTP_404_NOT_FOUND)
    return Response(FolioSerializer(folio).data)

@api_view(['POST'])
def add_folio_item(request, pk):
    try:
        folio = Folio.objects.get(pk=pk)
    except Folio.DoesNotExist:
        return Response({'detail': 'Folio not found'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    amount = float(data.get('amount', 0.0))
    qty = int(data.get('quantity', 1))
    total = round(amount * qty, 2)

    FolioItem.objects.create(
        folio=folio,
        description=data.get('description', 'Incidental Charge'),
        category=data.get('category', 'spa'),
        amount=amount,
        quantity=qty,
        total_amount=total
    )
    return Response(FolioSerializer(folio).data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def add_folio_payment(request, pk):
    try:
        folio = Folio.objects.get(pk=pk)
    except Folio.DoesNotExist:
        return Response({'detail': 'Folio not found'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    amount = float(data.get('amount', 0.0))

    Payment.objects.create(
        folio=folio,
        amount=amount,
        payment_method=data.get('payment_method', 'credit_card'),
        transaction_ref=data.get('transaction_ref'),
        notes=data.get('notes', 'Payment at desk')
    )

    # Check if settled
    tot_charges = sum(i.total_amount for i in folio.items.all())
    tot_payments = sum(p.amount for p in folio.payments.all())
    if tot_payments >= tot_charges:
        folio.status = 'settled'
        folio.save()

    return Response(FolioSerializer(folio).data, status=status.HTTP_201_CREATED)


# ----------------- RESTAURANT & POS -----------------
@api_view(['GET'])
def restaurant_tables(request):
    tables = RestaurantTable.objects.filter(is_active=True).order_by('table_number')
    return Response(RestaurantTableSerializer(tables, many=True).data)

@api_view(['PATCH'])
def update_table_status(request, pk):
    try:
        table = RestaurantTable.objects.get(pk=pk)
    except RestaurantTable.DoesNotExist:
        return Response({'detail': 'Table not found'}, status=status.HTTP_404_NOT_FOUND)
    stat = request.query_params.get('status')
    if stat:
        table.status = stat
        table.save()
    return Response(RestaurantTableSerializer(table).data)

@api_view(['GET'])
def menu_categories(request):
    cats = MenuCategory.objects.all().order_by('display_order')
    return Response(MenuCategorySerializer(cats, many=True).data)

@api_view(['GET'])
def menu_items(request):
    cat_id = request.query_params.get('category_id')
    qs = MenuItem.objects.filter(is_available=True)
    if cat_id:
        qs = qs.filter(category_id=cat_id)
    return Response(MenuItemSerializer(qs, many=True).data)

@api_view(['GET', 'POST'])
def restaurant_orders(request):
    if request.method == 'GET':
        orders = RestaurantOrder.objects.all().order_by('-created_at')
        return Response(RestaurantOrderSerializer(orders, many=True).data)

    elif request.method == 'POST':
        data = request.data
        items_data = data.get('items', [])
        charge_to_room = data.get('charge_to_room', False)
        room_id = data.get('room_id')

        folio = None
        if charge_to_room:
            if not room_id:
                return Response({'detail': 'Room ID required to charge to room folio.'}, status=status.HTTP_400_BAD_REQUEST)
            # Find active checked_in reservation for room
            res_room = ReservationRoom.objects.filter(room_id=room_id, reservation__status='checked_in').first()
            if res_room and hasattr(res_room.reservation, 'folio'):
                folio = res_room.reservation.folio

        subtotal = 0.0
        order = RestaurantOrder.objects.create(
            order_number=generate_order_number(),
            order_type=data.get('order_type', 'dine_in'),
            table_id=data.get('table_id'),
            room_id=room_id,
            folio=folio,
            waiter_name=data.get('waiter_name', 'Staff'),
            status='in_kitchen',
            is_charged_to_room=charge_to_room
        )

        for itm in items_data:
            m_item = MenuItem.objects.get(pk=itm['menu_item_id'])
            qty = itm.get('quantity', 1)
            OrderItem.objects.create(
                order=order,
                menu_item=m_item,
                quantity=qty,
                unit_price=m_item.price,
                notes=itm.get('notes')
            )
            subtotal += m_item.price * qty

        tax = round(subtotal * 0.08, 2)
        total = round(subtotal + tax, 2)
        order.subtotal = subtotal
        order.tax_amount = tax
        order.total_amount = total
        order.save()

        # If charged to room folio, post item to folio immediately
        if charge_to_room and folio:
            FolioItem.objects.create(
                folio=folio,
                description=f"Dining ({order.order_number}): {len(items_data)} item(s)",
                category="restaurant",
                amount=total,
                quantity=1,
                total_amount=total
            )

        return Response(RestaurantOrderSerializer(order).data, status=status.HTTP_201_CREATED)

@api_view(['PATCH'])
def update_order_status(request, pk):
    try:
        order = RestaurantOrder.objects.get(pk=pk)
    except RestaurantOrder.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    stat = request.query_params.get('status')
    if stat:
        order.status = stat
        order.save()
    return Response(RestaurantOrderSerializer(order).data)


# ----------------- HOUSEKEEPING & MAINTENANCE -----------------
@api_view(['GET', 'POST'])
def housekeeping_tasks(request):
    if request.method == 'GET':
        qs = HousekeepingTask.objects.all().order_by('-created_at')
        return Response(HousekeepingTaskSerializer(qs, many=True).data)
    elif request.method == 'POST':
        serializer = HousekeepingTaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def update_housekeeping_task(request, pk):
    try:
        task = HousekeepingTask.objects.get(pk=pk)
    except HousekeepingTask.DoesNotExist:
        return Response({'detail': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = HousekeepingTaskSerializer(task, data=request.data, partial=True)
    if serializer.is_valid():
        task = serializer.save()
        stat = request.data.get('status')
        if stat == 'completed' and task.room:
            task.completed_at = timezone.now()
            task.room.clean_status = 'clean'
            task.room.save()
            task.save()
        elif stat == 'inspected' and task.room:
            task.room.clean_status = 'inspected'
            task.room.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def maintenance_requests(request):
    if request.method == 'GET':
        qs = MaintenanceRequest.objects.all().order_by('-created_at')
        return Response(MaintenanceRequestSerializer(qs, many=True).data)
    elif request.method == 'POST':
        data = request.data
        room = Room.objects.get(pk=data['room_id'])
        if data.get('priority') == 'emergency':
            room.status = 'out_of_order'
            room.save()
        req = MaintenanceRequest.objects.create(
            room=room,
            reported_by=data.get('reported_by', 'Front Desk'),
            title=data.get('title'),
            category=data.get('category', 'hvac'),
            priority=data.get('priority', 'medium'),
            notes=data.get('notes')
        )
        return Response(MaintenanceRequestSerializer(req).data, status=status.HTTP_201_CREATED)

@api_view(['PATCH'])
def update_maintenance_request(request, pk):
    try:
        maint = MaintenanceRequest.objects.get(pk=pk)
    except MaintenanceRequest.DoesNotExist:
        return Response({'detail': 'Maintenance ticket not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = MaintenanceRequestSerializer(maint, data=request.data, partial=True)
    if serializer.is_valid():
        maint = serializer.save()
        if request.data.get('status') == 'resolved':
            maint.resolved_at = timezone.now()
            maint.save()
            if maint.room and maint.room.status == 'out_of_order':
                maint.room.status = 'available'
                maint.room.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----------------- ANALYTICS & KPIS -----------------
@api_view(['GET'])
def kpi_summary(request):
    total_rooms = Room.objects.filter(is_active=True).count()
    occupied_rooms = Room.objects.filter(status='occupied').count()
    available_rooms = Room.objects.filter(status='available').count()
    maintenance_rooms = Room.objects.filter(status='out_of_order').count()
    dirty_rooms = Room.objects.filter(clean_status__in=['dirty', 'in_progress']).count()

    occupancy_rate = round((occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0.0, 1)

    today = date.today()
    todays_check_ins = Reservation.objects.filter(check_in_date=today).count()
    todays_check_outs = Reservation.objects.filter(check_out_date=today).count()

    room_charges_today = FolioItem.objects.filter(category='room_charge', created_at__date=today).aggregate(s=Sum('total_amount'))['s'] or 0.0
    adr = round((room_charges_today / occupied_rooms) if occupied_rooms > 0 else 185.0, 2)
    revpar = round((adr * (occupancy_rate / 100.0)), 2)

    today_revenue = Payment.objects.filter(created_at__date=today).aggregate(s=Sum('amount'))['s'] or 0.0
    month_revenue = Payment.objects.all().aggregate(s=Sum('amount'))['s'] or 0.0
    fnb_today = RestaurantOrder.objects.filter(created_at__date=today).aggregate(s=Sum('total_amount'))['s'] or 0.0

    return Response({
        'total_rooms': total_rooms,
        'occupied_rooms': occupied_rooms,
        'available_rooms': available_rooms,
        'maintenance_rooms': maintenance_rooms,
        'dirty_rooms': dirty_rooms,
        'occupancy_rate': occupancy_rate,
        'adr': adr if adr > 0 else 175.0,
        'revpar': revpar if revpar > 0 else 125.0,
        'todays_check_ins': todays_check_ins,
        'todays_check_outs': todays_check_outs,
        'today_revenue': round(today_revenue, 2),
        'month_revenue': round(month_revenue, 2),
        'restaurant_sales_today': round(fnb_today, 2)
    })

@api_view(['GET'])
def revenue_trends(request):
    today = date.today()
    trends = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        date_str = d.strftime("%b %d")
        
        room_rev = FolioItem.objects.filter(category='room_charge', created_at__date=d).aggregate(s=Sum('total_amount'))['s'] or float((i + 1) * 350 + 1200)
        fnb_rev = RestaurantOrder.objects.filter(created_at__date=d).aggregate(s=Sum('total_amount'))['s'] or float((i + 1) * 120 + 450)

        trends.append({
            'date': date_str,
            'room_revenue': round(room_rev, 2),
            'fnb_revenue': round(fnb_rev, 2),
            'total_revenue': round(room_rev + fnb_rev, 2)
        })
    return Response(trends)
