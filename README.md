# E-Commerce Product & Order Management API

A production ready REST API built with Node.js, Express, and Mongoose to handle user authentication, inventory catalogs, shopping carts, and order checkouts. It includes request validation via `express-validator` and logging using Winston + Morgan.

---

## Quick Start & Setup

### 1. Install Dependencies
Spin up your terminal, navigate to the `Backend` directory, and pull in all the packages:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and populate it:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/e-commerce
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=myjforceinterviewassignment
ACCESS_TOKEN_EXPIRY=1d
```

### 3. Spin Up the Server
To launch the API in development mode (make sure you have a local MongoDB daemon running):
```bash
# Using nodemon for hot-reloading
npx nodemon src/index.js

# Or using standard node
node src/index.js
```
The console will log connection logs and show:
```
MongoDB connected || DB Host: localhost
Server is running at http://localhost:4000
```

---

## DB Schema Design

We use a referenced schema architecture in MongoDB to prevent huge nested document arrays and ensure data integrity.

```
                  ┌──────────────┐
                  │     User     │
                  └──────┬───────┘
                         │ 1:1
          ┌──────────────┼──────────────┐
          │ 1:1          │              │ 1:N
   ┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐
   │    Cart     ││   Order     ││  Feedback   │
   └──────┬──────┘└──────┬──────┘└──────────────┘
          │ 1:N          │ 1:N
   ┌──────▼──────┐┌──────▼──────┐
   │  CartItem   ││  OrderItem  │
   └──────┬──────┘└──────┬──────┘
          │ N:1          │ N:1
          └──────┬───────┘
                 │
          ┌──────▼──────┐
          │   Product   │
          └──────────────┘
```

### Database Schema Details

#### 1. User Schema (`User`)
Represents account profiles, role permissions, and credentials.
* `username`: `String` (Required, Unique, Lowercase, Trimmed, Indexed)
* `email`: `String` (Required, Unique, Lowercase, Trimmed)
* `password`: `String` (Required, Hashed via bcrypt pre-save)
* `role`: `String` (Enum: `["user", "admin"]`, Default: `"user"`)
* `timestamps`: Automatically populated `createdAt` and `updatedAt`.

#### 2. Product Schema (`Product`)
Catalog containing the inventory products and stock quantities.
* `name`: `String` (Required, Trimmed)
* `description`: `String` (Required, Trimmed)
* `price`: `Number` (Required, Minimum: 0)
* `stock`: `Number` (Required, Minimum: 0)
* `category`: `String` (Required, Trimmed)
* `isEnabled`: `Boolean` (Default: `true`)
* `timestamps`: Automatically populated `createdAt` and `updatedAt`.

#### 3. Cart Schema (`Cart`)
A user's active shopping cart session (1-to-1 mapping to User).
* `user`: `ObjectId` (Ref: `User`, Required)
* `items`: `[ObjectId]` (Ref: `CartItem`, Array of references to the items inside the cart)
* `timestamps`: Automatically populated `createdAt` and `updatedAt`.

#### 4. CartItem Schema (`CartItem`)
Detailed entry for a specific product inside a cart.
* `cart`: `ObjectId` (Ref: `Cart`, Required)
* `product`: `ObjectId` (Ref: `Product`, Required)
* `quantity`: `Number` (Required, Default: `1`, Minimum: `1`)
* *Compound Index*: `{ cart: 1, product: 1 }` (Unique constraint to prevent duplicate items for the same product in a single cart)
* `timestamps`: Automatically populated `createdAt` and `updatedAt`.

#### 5. Order Schema (`Order`)
Represents checkouts and invoice transactions.
* `user`: `ObjectId` (Ref: `User`, Required)
* `items`: `[ObjectId]` (Ref: `OrderItem`, Required, Array of references to the order line items)
* `status`: `String` (Required, Trimmed, Enum: `["pending", "processing", "shipped", "delivered", "cancelled"]`, Default: `"pending"`)
* `totalAmount`: `Number` (Required, Minimum: 0)
* `shippingAddress`: `String` (Required, Trimmed)
* `paymentMethod`: `String` (Required, Trimmed, Enum: `["COD", "UPI", "DEBIT", "CREDIT", "WALLET"]`, Default: `"COD"`)
* `paymentStatus`: `String` (Required, Trimmed, Enum: `["pending", "completed", "failed"]`, Default: `"pending"`)
* `timestamps`: Automatically populated `createdAt` and `updatedAt`.

#### 6. OrderItem Schema (`OrderItem`)
Captures transactional metadata for ordered products (preserving checkout prices).
* `order`: `ObjectId` (Ref: `Order`, Required)
* `product`: `ObjectId` (Ref: `Product`, Required)
* `quantity`: `Number` (Required, Minimum: 1)
* `price`: `Number` (Required, Minimum: 0) - Stores the unit price at checkout time to lock historical data.
* `timestamps`: Automatically populated `createdAt` and `updatedAt`.

---

#### Inventory Rules (Hooks)
* **On Purchase**: Placing an order decrements the product `stock` count by the ordered quantity.
* **On Cancellation**: Cancelling an order restores the matching product `stock` count.


---

## API Endpoints Checklist

All write endpoints (POST, PUT, PATCH, DELETE) and authenticated GET routes expect the `accessToken` cookie or an `Authorization: Bearer <token>` header.

### User & Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/user/register` | Register a new user |
| `POST` | `/api/v1/user/login` | Authenticate and get token cookie |
| `GET` | `/api/v1/user/logout` | Clear token cookie |

### Product Catalog
| Method | Endpoint | Description | Auth Requirement |
|---|---|---|---|
| `GET` | `/api/v1/product` | Fetch all active products | Logged in |
| `GET` | `/api/v1/product/:id` | Get details for one product | Logged in |
| `POST` | `/api/v1/product` | Add a new product | Admin only |
| `PATCH` | `/api/v1/product/:id` | Update product fields | Admin only |
| `PATCH` | `/api/v1/product/toggle-visibility/:id` | Toggle active status | Admin only |

### Shopping Cart
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/cart` | Retrieve user's current cart |
| `POST` | `/api/v1/cart/add` | Add product or increment its quantity |
| `PUT` | `/api/v1/cart/update` | Directly modify item quantity |
| `DELETE`| `/api/v1/cart/remove` | Delete item from cart |
| `DELETE`| `/api/v1/cart/clear` | Empty user's cart |

### Order Checkout
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/order` | Place an order from input items |
| `GET` | `/api/v1/order` | Retrieve past orders for user |
| `PATCH`| `/api/v1/order/cancel-order/:id` | Cancel order and restore stock |

---

## Sample Payloads (Postman Collections Reference)

The complete raw Postman payloads match the collection inside `./postman/Order_Product_Management.postman_collection.json`.

### 1. Register User (`POST /api/v1/user/register`)
```json
{
  "email": "dev.user@example.com",
  "username": "devuser",
  "password": "strongpassword123"
}
```

### 2. Login User (`POST /api/v1/user/login`)
```json
{
  "identifier": "devuser",
  "password": "strongpassword123"
}
```

### 3. Add Product (`POST /api/v1/product`)
```json
{
  "name": "Puma Men's Casual Shoe",
  "description": "Premium athletic fit running shoes.",
  "price": 1499,
  "stock": 12,
  "category": "Sports Wear"
}
```

### 4. Add to Cart (`POST /api/v1/cart/add`)
```json
{
  "productId": "6a30f65a8ce929be1ee9533b",
  "quantity": 2
}
```

### 5. Place Order (`POST /api/v1/order`)
```json
{
  "items": [
    {
      "product": "6a30f65a8ce929be1ee9533b",
      "quantity": 2
    }
  ],
  "shippingAddress": "123 Dev Lane, Tech City",
  "paymentMethod": "UPI"
}
```
