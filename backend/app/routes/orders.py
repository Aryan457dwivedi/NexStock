from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate, OrderResponse, OrderDetailResponse, OrderItemDetail

router = APIRouter()

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    # Validate customer
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {order.customer_id} not found"
        )

    # Validate products and check stock
    product_map = {}
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found"
            )
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
            )
        product_map[item.product_id] = product

    # Calculate total
    total = sum(
        product_map[item.product_id].price * item.quantity
        for item in order.items
    )

    # Create order
    db_order = Order(
        customer_id=order.customer_id,
        total_amount=round(total, 2),
        notes=order.notes
    )
    db.add(db_order)
    db.flush()

    # Create order items and reduce stock
    for item in order.items:
        product = product_map[item.product_id]
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=product.price
        )
        db.add(db_item)
        product.quantity -= item.quantity

    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/", response_model=List[OrderDetailResponse])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product)
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
    result = []
    for order in orders:
        items = []
        for item in order.items:
            items.append(OrderItemDetail(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                product_name=item.product.name if item.product else None,
                product_sku=item.product.sku if item.product else None
            ))
        result.append(OrderDetailResponse(
            id=order.id,
            customer_id=order.customer_id,
            customer_name=order.customer.full_name if order.customer else None,
            customer_email=order.customer.email if order.customer else None,
            status=order.status,
            total_amount=order.total_amount,
            notes=order.notes,
            created_at=order.created_at,
            items=items
        ))
    return result

@router.get("/{order_id}", response_model=OrderDetailResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product)
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found"
        )
    items = []
    for item in order.items:
        items.append(OrderItemDetail(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            product_name=item.product.name if item.product else None,
            product_sku=item.product.sku if item.product else None
        ))
    return OrderDetailResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name if order.customer else None,
        customer_email=order.customer.email if order.customer else None,
        status=order.status,
        total_amount=order.total_amount,
        notes=order.notes,
        created_at=order.created_at,
        items=items
    )

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found"
        )
    # Restore stock when cancelling
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity += item.quantity
    db.delete(order)
    db.commit()
