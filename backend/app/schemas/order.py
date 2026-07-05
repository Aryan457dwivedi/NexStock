from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float

    model_config = {"from_attributes": True}

class OrderItemDetail(OrderItemResponse):
    product_name: Optional[str] = None
    product_sku: Optional[str] = None

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]
    notes: Optional[str] = None

    @field_validator("items")
    @classmethod
    def items_must_not_be_empty(cls, v):
        if not v:
            raise ValueError("Order must contain at least one item")
        return v

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    status: str
    total_amount: float
    notes: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse] = []

    model_config = {"from_attributes": True}

class OrderDetailResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    status: str
    total_amount: float
    notes: Optional[str] = None
    created_at: datetime
    items: List[OrderItemDetail] = []

    model_config = {"from_attributes": True}
