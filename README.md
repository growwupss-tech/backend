# Site Snap Backend API

A comprehensive backend API for the Site Snap platform built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
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
```

**To get Cloudinary credentials:**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → Settings
3. Copy your Cloud Name, API Key, and API Secret

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

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Sellers

- `GET /api/sellers` - Get all sellers (Protected)
- `GET /api/sellers/:id` - Get single seller (Protected)
- `POST /api/sellers` - Create seller (Protected, Seller only)
- `PUT /api/sellers/:id` - Update seller (Protected, Seller only)
- `DELETE /api/sellers/:id` - Delete seller (Protected, Seller only)

### Businesses

- `GET /api/businesses` - Get all businesses (Protected)
- `GET /api/businesses/seller/:sellerId` - Get businesses by seller (Protected, Seller only)
- `GET /api/businesses/:id` - Get single business (Protected)
- `POST /api/businesses` - Create business (Protected, Seller only)
- `PUT /api/businesses/:id` - Update business (Protected, Owner only)
- `DELETE /api/businesses/:id` - Delete business (Protected, Owner only)

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

## Authentication

To use protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
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

1. **Public** - No authentication required
2. **Protected** - Requires valid JWT token
3. **Seller Only** - Requires authentication and seller association
4. **Owner Only** - Requires authentication and ownership of the resource

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

