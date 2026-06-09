# 06 — API Contracts

Tất cả endpoints đều đi qua API Gateway tại `https://api.toidibangiay.vn`.

**Response format chung:**
```json
{
  "data": { ... },        // Payload chính
  "meta": { ... }         // Pagination info (nếu có)
}
```

**Error format chung:**
```json
{
  "statusCode": 400,
  "message": "Mô tả lỗi",
  "errors": [             // Chi tiết validation errors (nếu có)
    { "field": "email", "message": "Email không hợp lệ" }
  ]
}
```

**Authentication:** Bearer token trong header `Authorization: Bearer <accessToken>`

---

## Auth Service — `/api/auth`

### POST /api/auth/register

Đăng ký tài khoản mới.

- **Auth required:** Không
- **Rate limit:** 10 requests/15 phút per IP

**Request body:**
```json
{
  "email": "nguyen@example.com",
  "password": "MyP@ssw0rd123",
  "fullName": "Nguyễn Văn A"
}
```

**Validation:**
- `email`: valid email, unique
- `password`: min 8 chars, phải có chữ hoa, chữ thường, số
- `fullName`: min 2 chars, max 100 chars

**Response 201:**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "nguyen@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "CUSTOMER",
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

**Error codes:**
| Status | Message |
|--------|---------|
| 400 | Validation errors (invalid email, weak password) |
| 409 | Email đã được đăng ký |

---

### POST /api/auth/login

- **Auth required:** Không
- **Rate limit:** 5 lần thất bại/15 phút per IP (sau đó block)

**Request body:**
```json
{
  "email": "nguyen@example.com",
  "password": "MyP@ssw0rd123"
}
```

**Response 200:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "nguyen@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "CUSTOMER"
    }
  }
}
```

**Error codes:**
| Status | Message |
|--------|---------|
| 401 | Email hoặc mật khẩu không đúng |
| 403 | Tài khoản bị khóa |
| 429 | Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút |

---

### POST /api/auth/logout

- **Auth required:** Có (Bearer token)

**Request body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "data": { "message": "Đăng xuất thành công" }
}
```

---

### POST /api/auth/refresh

Lấy access token mới bằng refresh token.

- **Auth required:** Không

**Request body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

**Error codes:**
| Status | Message |
|--------|---------|
| 401 | Refresh token không hợp lệ hoặc đã hết hạn |

---

### GET /api/auth/me

Lấy thông tin user hiện tại.

- **Auth required:** Có

**Response 200:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "nguyen@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "CUSTOMER",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## Product Service — `/api/products`

### GET /api/products

Lấy danh sách sản phẩm với filters, pagination.

- **Auth required:** Không

**Query parameters:**
| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| q | string | - | Full-text search |
| category | string | - | Category slug |
| brand | string | - | Tên brand (exact match) |
| minPrice | number | - | Giá tối thiểu (VND) |
| maxPrice | number | - | Giá tối đa (VND) |
| size | string[] | - | Size, có thể nhiều giá trị: `size=42&size=43` |
| color | string[] | - | Màu sắc |
| sort | string | popular | `popular`, `newest`, `price_asc`, `price_desc` |
| page | number | 1 | Số trang |
| limit | number | 20 | Items per page (max 100) |

**Response 200:**
```json
{
  "data": [
    {
      "id": "prod-uuid-1",
      "name": "Nike Air Max 270",
      "slug": "nike-air-max-270",
      "brand": "Nike",
      "category": {
        "id": "cat-uuid",
        "name": "Giày thể thao",
        "slug": "giay-the-thao"
      },
      "images": [
        {
          "url": "https://cdn.toidibangiay.vn/products/nike-air-max-270-1.webp",
          "altText": "Nike Air Max 270 màu đen"
        }
      ],
      "priceRange": {
        "min": 3200000,
        "max": 3800000
      },
      "compareAtPrice": 4200000,
      "availableSizes": ["40", "41", "42", "43", "44"],
      "availableColors": ["black", "white", "red"],
      "totalSold": 245,
      "isActive": true
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  },
  "aggregations": {
    "brands": [
      { "key": "Nike", "count": 45 },
      { "key": "Adidas", "count": 38 }
    ],
    "sizes": [
      { "key": "42", "count": 120 },
      { "key": "43", "count": 115 }
    ],
    "colors": [
      { "key": "black", "count": 89 },
      { "key": "white", "count": 76 }
    ]
  }
}
```

---

### GET /api/products/:slug

- **Auth required:** Không

**Response 200:**
```json
{
  "data": {
    "id": "prod-uuid-1",
    "name": "Nike Air Max 270",
    "slug": "nike-air-max-270",
    "description": "Nike Air Max 270 mang đến sự thoải mái tối đa...",
    "brand": "Nike",
    "category": { "id": "cat-uuid", "name": "Giày thể thao", "slug": "giay-the-thao" },
    "tags": ["chạy bộ", "thể thao", "Nike"],
    "images": [
      { "id": "img-1", "url": "https://cdn.toidibangiay.vn/...", "altText": "...", "position": 0 },
      { "id": "img-2", "url": "https://cdn.toidibangiay.vn/...", "altText": "...", "position": 1 }
    ],
    "variants": [
      {
        "id": "var-uuid-1",
        "sku": "NAM270-BLK-40",
        "price": 3200000,
        "compareAtPrice": 3800000,
        "attributes": { "size": "40", "color": "black" },
        "availableStock": 5,
        "isActive": true
      },
      {
        "id": "var-uuid-2",
        "sku": "NAM270-BLK-42",
        "price": 3200000,
        "compareAtPrice": 3800000,
        "attributes": { "size": "42", "color": "black" },
        "availableStock": 12,
        "isActive": true
      }
    ],
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-14T15:30:00.000Z"
  }
}
```

**Error codes:**
| Status | Message |
|--------|---------|
| 404 | Sản phẩm không tồn tại hoặc đã bị ẩn |

---

### POST /api/products

- **Auth required:** Có (ADMIN role)

**Request body:**
```json
{
  "name": "Nike Air Max 270",
  "description": "Mô tả chi tiết sản phẩm...",
  "brand": "Nike",
  "categoryId": "cat-uuid",
  "tags": ["chạy bộ", "thể thao"],
  "variants": [
    {
      "sku": "NAM270-BLK-40",
      "price": 3200000,
      "compareAtPrice": 3800000,
      "attributes": { "size": "40", "color": "black" },
      "initialStock": 20
    }
  ]
}
```

**Response 201:**
```json
{
  "data": {
    "id": "new-prod-uuid",
    "slug": "nike-air-max-270",
    ...
  }
}
```

---

### PUT /api/products/:id

- **Auth required:** Có (ADMIN role)

Request body: Partial update (chỉ gửi fields cần thay đổi).

**Response 200:** Trả về product đã update (cùng format với GET /products/:slug)

---

### DELETE /api/products/:id

Soft delete — chỉ set `isActive = false`.

- **Auth required:** Có (ADMIN role)

**Response 200:**
```json
{
  "data": { "message": "Sản phẩm đã được ẩn thành công" }
}
```

---

### GET /api/categories

- **Auth required:** Không

**Response 200:**
```json
{
  "data": [
    {
      "id": "cat-uuid-1",
      "name": "Giày thể thao",
      "slug": "giay-the-thao",
      "imageUrl": "https://cdn.toidibangiay.vn/categories/the-thao.webp",
      "productCount": 85,
      "children": [
        {
          "id": "cat-uuid-11",
          "name": "Giày chạy bộ",
          "slug": "giay-chay-bo",
          "productCount": 42
        }
      ]
    }
  ]
}
```

---

### GET /api/categories/:slug

- **Auth required:** Không

**Response 200:** Category detail cùng với danh sách sản phẩm (format giống GET /products).

---

## Cart Service — `/api/cart`

**Lưu ý:** Tất cả endpoints đều hỗ trợ guest (không cần login). Guest được identify bằng `x-session-id` cookie.

### GET /api/cart

- **Auth required:** Tùy chọn

**Response 200:**
```json
{
  "data": {
    "items": [
      {
        "variantId": "var-uuid-1",
        "quantity": 2,
        "product": {
          "id": "prod-uuid-1",
          "name": "Nike Air Max 270",
          "slug": "nike-air-max-270",
          "image": "https://cdn.toidibangiay.vn/products/..."
        },
        "variant": {
          "sku": "NAM270-BLK-42",
          "price": 3200000,
          "compareAtPrice": 3800000,
          "attributes": { "size": "42", "color": "black" }
        },
        "subtotal": 6400000,
        "addedAt": "2024-01-15T10:05:00.000Z"
      }
    ],
    "subtotal": 6400000,
    "itemCount": 2,
    "estimatedShipping": 30000,
    "estimatedTotal": 6430000
  }
}
```

---

### POST /api/cart/items

Thêm item vào giỏ. Nếu variantId đã có trong giỏ, tăng quantity.

- **Auth required:** Tùy chọn

**Request body:**
```json
{
  "variantId": "var-uuid-1",
  "quantity": 1
}
```

**Response 200:** Trả về cart đã update (cùng format GET /api/cart).

**Error codes:**
| Status | Message |
|--------|---------|
| 400 | Sản phẩm không tồn tại |
| 400 | Sản phẩm đã hết hàng |
| 400 | Số lượng yêu cầu vượt quá tồn kho (còn X đôi) |
| 400 | Số lượng tối đa 1 loại sản phẩm là 10 |

---

### PUT /api/cart/items/:variantId

Cập nhật quantity. Nếu quantity = 0, xóa item.

- **Auth required:** Tùy chọn

**Request body:**
```json
{
  "quantity": 3
}
```

**Response 200:** Trả về cart đã update.

---

### DELETE /api/cart/items/:variantId

Xóa một item khỏi giỏ.

- **Auth required:** Tùy chọn

**Response 200:** Trả về cart đã update.

---

### DELETE /api/cart

Xóa toàn bộ giỏ hàng.

- **Auth required:** Tùy chọn

**Response 200:**
```json
{
  "data": { "message": "Giỏ hàng đã được xóa" }
}
```

---

## Order Service — `/api/orders`

### POST /api/orders

Tạo đơn hàng từ giỏ hàng hiện tại.

- **Auth required:** Có

**Request body:**
```json
{
  "addressId": "addr-uuid",
  "paymentMethod": "VNPAY",
  "note": "Giao hàng giờ hành chính, gọi trước 30 phút"
}
```

**Validation:**
- Cart phải có ít nhất 1 item
- `addressId` phải thuộc về user đang đặt
- `paymentMethod`: `VNPAY`, `MOMO`, hoặc `COD`

**Response 201:**
```json
{
  "data": {
    "orderId": "order-uuid",
    "orderCode": "TDB-20240115-0001",
    "status": "PENDING",
    "items": [
      {
        "variantId": "var-uuid-1",
        "productName": "Nike Air Max 270",
        "variantTitle": "Size 42 / Black",
        "price": 3200000,
        "quantity": 2,
        "subtotal": 6400000
      }
    ],
    "subtotal": 6400000,
    "shippingFee": 30000,
    "discount": 0,
    "total": 6430000,
    "paymentMethod": "VNPAY",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_...",
    "shippingAddress": {
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      "street": "123 Nguyễn Huệ",
      "ward": "Phường Bến Nghé",
      "district": "Quận 1",
      "city": "TP. Hồ Chí Minh"
    },
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error codes:**
| Status | Message |
|--------|---------|
| 400 | Giỏ hàng trống |
| 400 | Địa chỉ không hợp lệ |
| 400 | Sản phẩm [X] đã hết hàng |
| 409 | Bạn đang có đơn hàng PENDING, vui lòng hoàn thành hoặc hủy trước |

---

### GET /api/orders

Lịch sử đơn hàng của user.

- **Auth required:** Có

**Query params:** `page` (default 1), `limit` (default 10), `status` (filter by status)

**Response 200:**
```json
{
  "data": [
    {
      "id": "order-uuid",
      "orderCode": "TDB-20240115-0001",
      "status": "DELIVERED",
      "total": 6430000,
      "itemCount": 2,
      "firstItemImage": "https://cdn.toidibangiay.vn/...",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "meta": { "total": 5, "page": 1, "limit": 10, "totalPages": 1 }
}
```

---

### GET /api/orders/:id

- **Auth required:** Có (chỉ xem đơn của chính mình; ADMIN xem được tất cả)

**Response 200:** Full order detail (xem mẫu ở Phase 2 docs).

**Error codes:**
| Status | Message |
|--------|---------|
| 403 | Bạn không có quyền xem đơn hàng này |
| 404 | Đơn hàng không tồn tại |

---

### PUT /api/orders/:id/cancel

- **Auth required:** Có

**Request body:**
```json
{
  "reason": "Tôi muốn đổi địa chỉ giao hàng"
}
```

**Response 200:**
```json
{
  "data": {
    "orderId": "order-uuid",
    "status": "CANCELLED",
    "cancelledAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error codes:**
| Status | Message |
|--------|---------|
| 400 | Đơn hàng đang ở trạng thái [X], không thể hủy |
| 403 | Bạn không có quyền hủy đơn hàng này |

---

## Payment Service — `/api/payments`

### POST /api/payments/vnpay/create

- **Auth required:** Có

**Request body:**
```json
{
  "orderId": "order-uuid"
}
```

**Response 200:**
```json
{
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=643000&...",
    "txnRef": "order-uuid-20240115100000",
    "expireAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### GET /api/payments/vnpay/return

VNPay redirect user về đây sau khi thanh toán. **Đây là redirect URL, không phải API call thuần.**

- **Auth required:** Không (VNPay gọi với query params)

**Query params từ VNPay:** `vnp_TxnRef`, `vnp_ResponseCode`, `vnp_SecureHash`, etc.

**Behavior:**
- Verify signature
- Nếu `vnp_ResponseCode === "00"`: thanh toán thành công → redirect to `/checkout/success?orderId=xxx`
- Nếu khác: thanh toán thất bại → redirect to `/checkout/failed?orderId=xxx`

---

### POST /api/payments/momo/create

- **Auth required:** Có

**Request body:**
```json
{
  "orderId": "order-uuid"
}
```

**Response 200:**
```json
{
  "data": {
    "payUrl": "https://test-payment.momo.vn/v2/gateway/pay?...",
    "deeplink": "momo://...",
    "qrCodeUrl": "https://test-payment.momo.vn/v2/gateway/qr/...",
    "expireAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### POST /api/payments/momo/notify

MoMo IPN (Instant Payment Notification) webhook. **Không phải client call.**

- **Auth required:** Không (MoMo call với HMAC signature)

**Request body từ MoMo:**
```json
{
  "partnerCode": "MOMOXXXX",
  "orderId": "order-uuid",
  "requestId": "request-uuid",
  "amount": 6430000,
  "resultCode": 0,
  "message": "Thành công",
  "signature": "..."
}
```

**Response 200:** `{ "message": "ok" }` (MoMo cần response này để confirm nhận webhook)

---

## Search Service — `/api/search`

### GET /api/search

Full-text search sản phẩm.

- **Auth required:** Không

**Query params:** `q` (required), `page`, `limit`, filters (cùng với GET /api/products)

**Response 200:** Cùng format với GET /api/products

---

### GET /api/search/suggest

Autocomplete suggestions.

- **Auth required:** Không

**Query params:** `q` (required)

**Response 200:**
```json
{
  "data": {
    "suggestions": [
      "Nike Air Max 270",
      "Nike Air Force 1",
      "Nike Air Jordan"
    ]
  }
}
```

---

## Admin Endpoints — `/api/admin`

Tất cả admin endpoints yêu cầu role ADMIN hoặc SUPER_ADMIN.

### GET /api/admin/orders

Lấy tất cả đơn hàng (admin view).

- **Auth required:** ADMIN

**Query params:** `page`, `limit`, `status`, `userId`, `dateFrom`, `dateTo`, `orderCode`

**Response 200:** Paginated list với full order details.

---

### PUT /api/admin/orders/:id/status

- **Auth required:** ADMIN

**Request body:**
```json
{
  "status": "SHIPPED",
  "note": "Mã vận đơn GHTK: GHTK123456789",
  "trackingNumber": "GHTK123456789"
}
```

---

### GET /api/admin/inventory

- **Auth required:** ADMIN

**Response 200:**
```json
{
  "data": [
    {
      "variantId": "var-uuid-1",
      "sku": "NAM270-BLK-42",
      "productName": "Nike Air Max 270",
      "variantTitle": "Size 42 / Black",
      "quantity": 20,
      "reserved": 3,
      "available": 17,
      "warehouse": "HCM"
    }
  ]
}
```

---

### POST /api/admin/inventory/restock

- **Auth required:** ADMIN

**Request body:**
```json
{
  "variantId": "var-uuid-1",
  "quantity": 50,
  "note": "Nhập hàng tháng 1/2024"
}
```

**Response 200:**
```json
{
  "data": {
    "variantId": "var-uuid-1",
    "previousQuantity": 5,
    "addedQuantity": 50,
    "newQuantity": 55,
    "available": 52
  }
}
```

---

## HTTP Status Codes Tổng Hợp

| Code | Ý nghĩa |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (chưa đăng nhập hoặc token hết hạn) |
| 403 | Forbidden (đã đăng nhập nhưng không có quyền) |
| 404 | Not Found |
| 409 | Conflict (ví dụ: email đã tồn tại) |
| 422 | Unprocessable Entity (logic error, ví dụ: hết hàng) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |
