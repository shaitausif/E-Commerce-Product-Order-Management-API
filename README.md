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

* **User**: Manages roles (`user` or `admin`), handles password hashing via `bcrypt`, and generates JWT access tokens.
* **Product**: Catalog system with stock inventory numbers and an `isEnabled` flag to toggle visibility on frontend feeds.
* **Cart & CartItem**: Split into two collections to keep documents lightweight. CartItem contains a compound unique index on `{ cart, product }` to prevent multiple rows of the same product.
* **Order & OrderItem**: Standard invoice/checkout system. Crucially, the **`OrderItem` collection stores the unit price at the time of purchase** (`price: product.price`). This keeps historical order data safe from future product price changes.
* **Inventory Hook**: Placing an order decrements the product `stock` count. If a user cancels an order, the system automatically restores that stock to the catalog.

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
