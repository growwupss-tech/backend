# Role-Based Access Control System

## Overview

This document explains the role-based access control (RBAC) system implemented in the Site Snap backend API.

## Roles

### 1. Visitor (Default Role)
- **Created**: Automatically assigned when user registers
- **Access**: 
  - Can register and login
  - Can create seller profile (which upgrades to seller role)
- **Restrictions**: Cannot access any seller-related routes except creating seller profile

### 2. Seller
- **Upgrade**: Visitor upgrades to seller after creating seller profile (after purchase)
- **Access**:
  - Can access all seller-related routes for their own data only
  - Can manage their own businesses, products, categories, etc.
  - Cannot access other sellers' data
- **Restrictions**: 
  - Can only view/update/delete their own seller profile
  - Can only view/update/delete their own businesses
  - Cannot access admin routes

### 3. Admin
- **Assignment**: Manually assigned by another admin via `/api/admin/users/:id/role`
- **Access**:
  - Full access to ALL routes
  - Can view/update/delete any seller
  - Can view/update/delete any business
  - Can manage all users (view, update roles, delete)
- **No Restrictions**: Admin has complete system access

## Role Upgrade Flow

```
1. User registers → Role: "visitor"
   ↓
2. Visitor creates seller profile → Role: "seller" (automatic upgrade)
   ↓
3. Admin assigns admin role → Role: "admin" (manual assignment)
```

## Middleware Functions

### `protect`
- Verifies JWT token
- Attaches user to `req.user`
- Required for all protected routes

### `isAdmin`
- Checks if user role is "admin"
- Used for admin-only routes

### `isSeller`
- Allows admin OR seller role
- Admin can access seller routes
- Sellers must have seller_id
- Used for seller-related routes

### `isVisitor`
- Checks if user role is "visitor"
- Used for visitor-only routes (if needed)

### `ownsResource`
- Admin can access all resources
- Sellers can only access their own resources
- Used for ownership checks

### `ownsBusiness`
- Admin can access all businesses
- Sellers can only access their own businesses
- Used for business ownership checks

## API Endpoints by Role

### Public (No Authentication)
- `POST /api/auth/register` - Register new user (creates visitor)
- `POST /api/auth/login` - Login user
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `GET /api/categories` - List categories
- `GET /api/categories/:id` - Get category
- `GET /api/attributes` - List attributes
- `GET /api/attributes/:id` - Get attribute
- `GET /api/hero-slides` - List hero slides
- `GET /api/hero-slides/:id` - Get hero slide
- `GET /api/stories` - List stories
- `GET /api/stories/:id` - Get story
- `GET /api/story-cards` - List story cards
- `GET /api/story-cards/:id` - Get story card

### Visitor (Authenticated)
- `POST /api/sellers` - Create seller profile (upgrades to seller role)
- `GET /api/auth/me` - Get own user profile

### Seller (Authenticated with Seller Role)
- All seller profile routes (own data only)
- All business routes (own businesses only)
- Product management (create, update, delete)
- Category management (create, update, delete)
- Attribute management (create, update, delete)
- Site details management
- Hero slides management
- Stories management
- Story cards management
- Analytics (own data)

### Admin (Authenticated with Admin Role)
- All admin routes (`/api/admin/*`)
- All seller routes (can access any seller)
- All business routes (can access any business)
- All other routes (full access)

## Example Usage

### 1. Register as Visitor
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "...",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "role": "visitor",
    "seller_id": null
  }
}
```

### 2. Create Seller Profile (Upgrades to Seller)
```bash
POST /api/sellers
Authorization: Bearer <token>
{
  "name": "John Doe",
  "phone_number": 1234567890,
  "whatsapp_number": 1234567890,
  "address": "123 Main St"
}

Response:
{
  "success": true,
  "data": { ... },
  "message": "Seller profile created and linked to your account. Your role has been upgraded to seller."
}

# User role is now "seller"
```

### 3. Admin Updates User Role
```bash
PUT /api/admin/users/:id/role
Authorization: Bearer <admin-token>
{
  "role": "admin"
}

Response:
{
  "success": true,
  "data": { ... },
  "message": "User role updated to admin"
}
```

## Security Notes

1. **Role Validation**: All role checks are performed both in middleware and controllers for double protection
2. **Ownership Checks**: Sellers can only access their own resources (admin bypasses this)
3. **Admin Safety**: Admin cannot change their own role from admin (safety measure)
4. **Auto-Upgrade**: Creating seller profile automatically upgrades visitor to seller
5. **Auto-Downgrade**: Deleting seller profile downgrades seller to visitor

## Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['visitor', 'seller', 'admin'], default: 'visitor'),
  seller_id: ObjectId (ref: 'Seller', optional),
  createdAt: Date,
  updatedAt: Date
}
```

## Testing Roles

### Test as Visitor
1. Register new user
2. Try to access seller routes → Should get 403 Forbidden
3. Create seller profile → Should succeed and upgrade to seller

### Test as Seller
1. Login as seller
2. Try to access other seller's data → Should get 403 Forbidden
3. Try to access own data → Should succeed
4. Try to access admin routes → Should get 403 Forbidden

### Test as Admin
1. Login as admin
2. Access any seller's data → Should succeed
3. Access any business → Should succeed
4. Manage users → Should succeed

