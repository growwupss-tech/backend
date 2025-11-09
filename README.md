# Site Snap Backend API

A comprehensive backend API for the Site Snap platform built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (RBAC)
- **Role-Based Access Control**: Three roles - Admin, Seller, and Visitor with appropriate permissions
- **MongoDB Database**: JSON document structure matching the ERD schema
- **RESTful APIs**: Complete CRUD operations for all entities
- **Relationship Management**: Proper handling of references between entities
- **Cloudinary Integration**: Image and video upload, storage, and deletion through Cloudinary

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Cloudinary for media storage
- Multer for file upload handling

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=3000
# For MongoDB Atlas use the full SRV with username/password embedded
# Example: mongodb+srv://<username>:<password>@<cluster-host>/<db-name>?retryWrites=true&w=majority
MONGODB_URI=mongodb://localhost:27017/site-snap
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Google OAuth (Optional - for Google Sign-In)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Email OTP Service (Required for email OTP to work)
# For Gmail, you need to create an App Password (not your regular password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_SERVICE=gmail

# For custom SMTP (optional - if not using Gmail):
# EMAIL_SERVICE=smtp
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=false

# For SMS OTP (Optional - for phone OTP):
# TWILIO_ACCOUNT_SID=your-twilio-account-sid
# TWILIO_AUTH_TOKEN=your-twilio-auth-token
# TWILIO_PHONE_NUMBER=+1234567890
```

**To get Cloudinary credentials:**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → Settings
3. Copy your Cloud Name, API Key, and API Secret

**To get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Copy the Client ID

**Email OTP Setup (Required for email verification):**

To receive OTP emails, you need to configure email service in your `.env` file:

**For Gmail (Recommended for development):**
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to: Security → 2-Step Verification (enable it if not already enabled)
3. Go to: Security → App passwords
4. Create a new App Password:
   - Select "Mail" as the app
   - Select "Other" as the device and name it "Site Snap Backend"
   - Click "Generate"
   - Copy the 16-character password (no spaces)
5. Add to `.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   EMAIL_SERVICE=gmail
   ```

**For Other Email Services:**
- **Outlook/Hotmail**: Use `EMAIL_SERVICE=outlook`
- **Yahoo**: Use `EMAIL_SERVICE=yahoo`
- **Custom SMTP**: Use `EMAIL_SERVICE=smtp` and configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`

**Note:**
- If `EMAIL_USER` and `EMAIL_PASS` are not set, OTP codes will be logged to console only
- For production, consider using professional email services like SendGrid, AWS SES, or Mailgun

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Swagger UI

- Open your browser at `http://localhost:3000/api-docs` to explore and call the APIs directly.
- For protected endpoints, click "Authorize" in Swagger and paste `Bearer <your-jwt-token>`.

### Authentication

The API supports three authentication methods:

#### 1. Email/Password Authentication
- `POST /api/auth/register` - Register with email and password (sends OTP to email)
- `POST /api/auth/verify-email-otp` - Verify email OTP to complete registration
- `POST /api/auth/login` - Login with email and password

#### 2. Phone Number Authentication (with OTP)
- `POST /api/auth/phone/send-otp` - Send OTP to phone number (requires email for signup)
- `POST /api/auth/phone/verify-otp` - Verify phone OTP to complete registration/login

#### 3. Google OAuth Authentication
- `POST /api/auth/google` - Login/Register with Google (requires Google ID token)

#### Other Endpoints
- `POST /api/auth/resend-otp` - Resend OTP to email or phone
- `GET /api/auth/me` - Get current user (Protected)

### Admin (Admin Role Required)

- `GET /api/admin/users` - Get all users (Admin only)
- `GET /api/admin/users/:id` - Get user by ID (Admin only)
- `PUT /api/admin/users/:id/role` - Update user role (Admin only)
- `DELETE /api/admin/users/:id` - Delete user (Admin only)

### Sellers

- `GET /api/sellers` - Get all sellers (Admin: all, Seller: own only)
- `GET /api/sellers/:id` - Get seller by ID (Admin: any, Seller: own only)
- `POST /api/sellers` - Create seller profile (Upgrades visitor to seller role)
- `PUT /api/sellers/:id` - Update seller (Admin: any, Seller: own only)
- `DELETE /api/sellers/:id` - Delete seller (Admin: any, Seller: own only)

### Businesses

- `GET /api/businesses` - Get all businesses (Admin: all, Seller: own only)
- `GET /api/businesses/seller/:sellerId` - Get businesses by seller (Admin: any, Seller: own only)
- `GET /api/businesses/:id` - Get single business (Admin: any, Seller: own only)
- `POST /api/businesses` - Create business (Seller role required, Admin can create for any seller)
- `PUT /api/businesses/:id` - Update business (Admin: any, Seller: own only)
- `DELETE /api/businesses/:id` - Delete business (Admin: any, Seller: own only)

### Site Details

- `GET /api/site-details` - Get all sites (Protected)
- `GET /api/site-details/:id` - Get single site (Protected)
- `POST /api/site-details` - Create site (Protected, Seller only)
- `PUT /api/site-details/:id` - Update site (Protected, Seller only)
- `DELETE /api/site-details/:id` - Delete site (Protected, Seller only)
- `PUT /api/site-details/:id/hero-slides` - Add hero slide to site
- `DELETE /api/site-details/:id/hero-slides/:heroSlideId` - Remove hero slide from site

### Products

- `GET /api/products` - Get all products (Public)
- `GET /api/products/:id` - Get single product (Public)
- `POST /api/products` - Create product (Protected, Seller only)
- `PUT /api/products/:id` - Update product (Protected, Seller only)
- `DELETE /api/products/:id` - Delete product (Protected, Seller only)
- `PUT /api/products/:id/redirect` - Increment redirects (Public)

### Categories

- `GET /api/categories` - Get all categories (Public)
- `GET /api/categories/:id` - Get single category (Public)
- `POST /api/categories` - Create category (Protected, Seller only)
- `PUT /api/categories/:id` - Update category (Protected, Seller only)
- `DELETE /api/categories/:id` - Delete category (Protected, Seller only)

### Attributes

- `GET /api/attributes` - Get all attributes (Public)
- `GET /api/attributes/:id` - Get single attribute (Public)
- `POST /api/attributes` - Create attribute (Protected, Seller only)
- `PUT /api/attributes/:id` - Update attribute (Protected, Seller only)
- `DELETE /api/attributes/:id` - Delete attribute (Protected, Seller only)

### Hero Slides

- `GET /api/hero-slides` - Get all hero slides (Public)
- `GET /api/hero-slides/:id` - Get single hero slide (Public)
- `POST /api/hero-slides` - Create hero slide (Protected, Seller only)
- `PUT /api/hero-slides/:id` - Update hero slide (Protected, Seller only)
- `DELETE /api/hero-slides/:id` - Delete hero slide (Protected, Seller only)

### Stories

- `GET /api/stories` - Get all stories (Public)
- `GET /api/stories/:id` - Get single story (Public)
- `POST /api/stories` - Create story (Protected, Seller only)
- `PUT /api/stories/:id` - Update story (Protected, Seller only)
- `DELETE /api/stories/:id` - Delete story (Protected, Seller only)
- `PUT /api/stories/:id/story-cards` - Add story card to story
- `DELETE /api/stories/:id/story-cards/:storyCardId` - Remove story card from story

### Story Cards

- `GET /api/story-cards` - Get all story cards (Public)
- `GET /api/story-cards/:id` - Get single story card (Public)
- `POST /api/story-cards` - Create story card (Protected, Seller only)
- `PUT /api/story-cards/:id` - Update story card (Protected, Seller only)
- `DELETE /api/story-cards/:id` - Delete story card (Protected, Seller only)

### Analytics

- `GET /api/analytics` - Get all analytics (Protected)
- `GET /api/analytics/business/:businessId` - Get analytics by business (Protected, Seller only)
- `GET /api/analytics/:id` - Get single analytics record (Protected)
- `POST /api/analytics` - Create analytics record (Protected, Seller only)
- `PUT /api/analytics/:id` - Update analytics record (Protected, Seller only)
- `DELETE /api/analytics/:id` - Delete analytics record (Protected, Seller only)
- `PUT /api/analytics/:id/views` - Increment views (Public)
- `PUT /api/analytics/:id/clicks` - Increment clicks (Public)

## Role-Based Access Control (RBAC)

The system implements three roles with different access levels:

### 1. **Visitor** (Default Role)
- **Access**: Can only register and login
- **Upgrade**: After purchase, can create seller profile to upgrade to "seller" role
- **Endpoints**: 
  - `POST /api/auth/register` (Public)
  - `POST /api/auth/login` (Public)
  - `POST /api/sellers` (Creates seller profile and upgrades to seller role)

### 2. **Seller**
- **Access**: Can access seller-related routes for their own data only
- **Restrictions**: Cannot access other sellers' data
- **Endpoints**:
  - All seller profile routes (own data only)
  - All business routes (own businesses only)
  - Product, category, attribute management
  - Site details, hero slides, stories management
  - Analytics (own data)

### 3. **Admin**
- **Access**: Can access ALL routes and manage all users
- **Privileges**: 
  - Full access to all sellers (view, update, delete any seller)
  - Full access to all businesses (view, update, delete any business)
  - User management (view, update roles, delete users)
  - All seller-related routes
- **Endpoints**:
  - `/api/admin/users` - User management
  - All seller routes (can access any seller)
  - All business routes (can access any business)
  - All other routes

### Role Upgrade Flow

1. **Visitor Registration**: User registers → Gets "visitor" role
2. **Purchase & Upgrade**: Visitor creates seller profile → Role upgrades to "seller"
3. **Admin Assignment**: Admin can manually assign "admin" role via `/api/admin/users/:id/role`

## Authentication

To use protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting Your Role

After login, the response includes your role:

```json
{
  "success": true,
  "token": "...",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "role": "visitor",  // or "seller" or "admin"
    "seller_id": null
  }
}
```

### Register Example

```json
POST /api/auth/register
{
  "password": "password123",
  "sellerInfo": {
    "name": "John Doe",
    "phone_number": 1234567890,
    "whatsapp_number": 1234567890,
    "address": "123 Main St"
  }
}
```

### Login Example

```json
POST /api/auth/login
{
  "userId": "507f1f77bcf86cd799439011",
  "password": "password123"
}
```

## Database Schema

The database uses MongoDB with the following collections:

1. **User** - User accounts with password hashing
2. **Seller** - Seller/vendor information
3. **Business** - Business entities owned by sellers
4. **Site_Details** - Website/storefront details
5. **Products** - Product information
6. **Category** - Product categories
7. **Attributes** - Product attributes (color, size, etc.)
8. **Hero_Slides** - Hero slides for websites
9. **Story** - Story collections
10. **Story_Cards** - Individual story cards
11. **Analytics** - Analytics tracking data

All relationships are maintained using MongoDB ObjectId references.

## File Upload with Cloudinary

The backend supports image and video uploads through Cloudinary for the following entities:

### Products (Multiple Images)
- **Create**: `POST /api/products` with `multipart/form-data`
  - Field name: `images` (array of files)
  - Supports up to 10 images per product
  - Formats: jpg, jpeg, png, gif, webp, mp4, mov, avi, webm
  
- **Update**: `PUT /api/products/:id` with `multipart/form-data`
  - Send `imagesToKeep` array in body to preserve existing images
  - Upload new images via `images` field
  - Old images not in `imagesToKeep` will be deleted from Cloudinary

- **Delete**: Automatically deletes all associated images from Cloudinary

### Hero Slides (Single Image)
- **Create**: `POST /api/hero-slides` with `multipart/form-data`
  - Field name: `image` (single file)
  
- **Update**: `PUT /api/hero-slides/:id` with `multipart/form-data`
  - Old image is automatically deleted when new one is uploaded

- **Delete**: Automatically deletes associated image from Cloudinary

### Story Cards (Single Image)
- **Create**: `POST /api/story-cards` with `multipart/form-data`
  - Field name: `story_card_image` (single file)
  
- **Update**: `PUT /api/story-cards/:id` with `multipart/form-data`
  - Old image is automatically deleted when new one is uploaded

- **Delete**: Automatically deletes associated image from Cloudinary

### Example Request (Using Postman/Insomnia):
```
POST /api/products
Content-Type: multipart/form-data

Body (form-data):
- images: [file1.jpg, file2.jpg]
- product_name: "Laptop"
- price: 999.99
- category_id: "507f1f77bcf86cd799439011"
- etc...
```

All uploaded files are automatically stored in Cloudinary's `site-snap` folder and URLs are saved in the database.

## Authorization Levels

1. **Public** - No authentication required (Register, Login, Public product/category views)
2. **Protected** - Requires valid JWT token (Any authenticated user)
3. **Seller Role** - Requires seller role or admin role
4. **Admin Role** - Requires admin role (Full system access)
5. **Owner Only** - Sellers can only access their own resources (Admin can access all)

## Error Handling

All endpoints return consistent JSON error responses:

```json
{
  "success": false,
  "message": "Error message"
}
```

Success responses:

```json
{
  "success": true,
  "data": {...}
}
```

## License

ISC

