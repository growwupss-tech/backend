const pkg = require('../package.json');

const bearerAuth = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Use JWT from /api/auth/login or /api/auth/register',
};

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
};

const buildPaths = () => ({
  // Auth
  '/api/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user with email and password',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/AuthRegisterRequest' } },
        },
      },
      responses: { 201: { description: 'Created' }, 400: { description: 'Bad request' } },
    },
  },
  '/api/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login with email and password',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/AuthLoginRequest' } },
        },
      },
      responses: { 200: { description: 'OK' }, 401: { description: 'Invalid credentials' } },
    },
  },
  '/api/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Get current user',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } },
    },
  },

  // Products
  '/api/products': {
    get: {
      tags: ['Products'],
      summary: 'List products',
      parameters: [
        { name: 'is_visible', in: 'query', schema: { type: 'boolean' } },
        { name: 'category_id', in: 'query', schema: { type: 'string' } },
      ],
      responses: { 200: { description: 'OK' } },
    },
    post: {
      tags: ['Products'],
      summary: 'Create product',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                product_name: { type: 'string' },
                product_descriptio: { type: 'string' },
                price: { type: 'number' },
                is_visible: { type: 'boolean' },
                inventory: { type: 'string' },
                category_id: { type: 'string' },
                attribute_ids: { type: 'array', items: { type: 'string' } },
                images: { type: 'array', items: { type: 'string', format: 'binary' } },
              },
              required: ['product_name', 'price', 'category_id'],
              description: "images: accept multiple files of types ['jpg','jpeg','png','gif','webp','mp4','mov','avi','webm']",
            },
          },
        },
      },
      responses: { 201: { description: 'Created' }, 401: { description: 'Unauthorized' } },
    },
  },
  '/api/products/{id}': {
    parameters: [idParam],
    get: { tags: ['Products'], summary: 'Get product', responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } } },
    put: {
      tags: ['Products'],
      summary: 'Update product',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                product_name: { type: 'string' },
                product_descriptio: { type: 'string' },
                price: { type: 'number' },
                is_visible: { type: 'boolean' },
                inventory: { type: 'string' },
                category_id: { type: 'string' },
                attribute_ids: { type: 'array', items: { type: 'string' } },
                images: { type: 'array', items: { type: 'string', format: 'binary' } },
                imagesToKeep: { type: 'array', items: { type: 'string' }, description: 'URLs of existing images to keep' },
              },
              description: "images: accept multiple files of types ['jpg','jpeg','png','gif','webp','mp4','mov','avi','webm']",
            },
          },
        },
      },
      responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } },
    },
    delete: { tags: ['Products'], summary: 'Delete product', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } } },
  },
  '/api/products/{id}/redirect': {
    parameters: [idParam],
    put: { tags: ['Products'], summary: 'Increment product redirect', responses: { 200: { description: 'OK' } } },
  },

  // Categories
  '/api/categories': {
    get: { tags: ['Categories'], summary: 'List categories', responses: { 200: { description: 'OK' } } },
    post: { tags: ['Categories'], summary: 'Create category', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryCreate' } } } }, responses: { 201: { description: 'Created' } } },
  },
  '/api/categories/{id}': {
    parameters: [idParam],
    get: { tags: ['Categories'], summary: 'Get category', responses: { 200: { description: 'OK' } } },
    put: { tags: ['Categories'], summary: 'Update category', security: [{ bearerAuth: [] }], requestBody: { required: false, content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryUpdate' } } } }, responses: { 200: { description: 'OK' } } },
    delete: { tags: ['Categories'], summary: 'Delete category', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
  },

  // Sellers
  '/api/sellers': {
    get: { tags: ['Sellers'], summary: 'List all sellers', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } } },
    post: { tags: ['Sellers'], summary: 'Create seller profile for authenticated user', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SellerCreate' } } } }, responses: { 201: { description: 'Created' }, 400: { description: 'User already has seller profile' } } },
  },
  '/api/sellers/me': {
    get: { tags: ['Sellers'], summary: 'Get current user\'s seller profile', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' }, 404: { description: 'No seller profile found' } } },
    put: { tags: ['Sellers'], summary: 'Update current user\'s seller profile', security: [{ bearerAuth: [] }], requestBody: { required: false, content: { 'application/json': { schema: { $ref: '#/components/schemas/SellerUpdate' } } } }, responses: { 200: { description: 'OK' }, 404: { description: 'No seller profile found' } } },
    delete: { tags: ['Sellers'], summary: 'Delete current user\'s seller profile', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' }, 404: { description: 'No seller profile found' } } },
  },
  '/api/sellers/{id}': {
    parameters: [idParam],
    get: { tags: ['Sellers'], summary: 'Get seller by ID', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } } },
    put: { tags: ['Sellers'], summary: 'Update seller (own profile only)', security: [{ bearerAuth: [] }], requestBody: { required: false, content: { 'application/json': { schema: { $ref: '#/components/schemas/SellerUpdate' } } } }, responses: { 200: { description: 'OK' }, 403: { description: 'Forbidden - can only update own profile' } } },
    delete: { tags: ['Sellers'], summary: 'Delete seller (own profile only)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' }, 403: { description: 'Forbidden - can only delete own profile' } } },
  },

  // Businesses
  '/api/businesses': {
    get: { tags: ['Businesses'], summary: 'List businesses', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    post: { tags: ['Businesses'], summary: 'Create business', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BusinessCreate' } } } }, responses: { 201: { description: 'Created' } } },
  },
  '/api/businesses/seller/{sellerId}': {
    parameters: [{ name: 'sellerId', in: 'path', required: true, schema: { type: 'string' } }],
    get: { tags: ['Businesses'], summary: 'List businesses by seller', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
  },
  '/api/businesses/{id}': {
    parameters: [idParam],
    get: { tags: ['Businesses'], summary: 'Get business', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    put: { tags: ['Businesses'], summary: 'Update business', security: [{ bearerAuth: [] }], requestBody: { required: false, content: { 'application/json': { schema: { $ref: '#/components/schemas/BusinessUpdate' } } } }, responses: { 200: { description: 'OK' } } },
    delete: { tags: ['Businesses'], summary: 'Delete business', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
  },

  // Site Details
  '/api/site-details': {
    get: { tags: ['SiteDetails'], summary: 'List site details', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    post: { tags: ['SiteDetails'], summary: 'Create site detail', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SiteDetailsCreate' } } } }, responses: { 201: { description: 'Created' } } },
  },
  '/api/site-details/{id}': {
    parameters: [idParam],
    get: { tags: ['SiteDetails'], summary: 'Get site detail', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    put: { tags: ['SiteDetails'], summary: 'Update site detail', security: [{ bearerAuth: [] }], requestBody: { required: false, content: { 'application/json': { schema: { $ref: '#/components/schemas/SiteDetailsUpdate' } } } }, responses: { 200: { description: 'OK' } } },
    delete: { tags: ['SiteDetails'], summary: 'Delete site detail', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
  },
  '/api/site-details/{id}/hero-slides': {
    parameters: [idParam],
    put: { tags: ['SiteDetails'], summary: 'Add hero slide to site detail', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AddHeroSlideRequest' } } } }, responses: { 200: { description: 'OK' } } },
  },
  '/api/site-details/{id}/hero-slides/{heroSlideId}': {
    parameters: [idParam, { name: 'heroSlideId', in: 'path', required: true, schema: { type: 'string' } }],
    delete: { tags: ['SiteDetails'], summary: 'Remove hero slide from site detail', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
  },

  // Hero Slides
  '/api/hero-slides': {
    get: { tags: ['HeroSlides'], summary: 'List hero slides', responses: { 200: { description: 'OK' } } },
    post: { tags: ['HeroSlides'], summary: 'Create hero slide', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/HeroSlideCreate' } } } }, responses: { 201: { description: 'Created' } } },
  },
  '/api/hero-slides/{id}': {
    parameters: [idParam],
    get: { tags: ['HeroSlides'], summary: 'Get hero slide', responses: { 200: { description: 'OK' } } },
    put: { tags: ['HeroSlides'], summary: 'Update hero slide', security: [{ bearerAuth: [] }], requestBody: { required: false, content: { 'application/json': { schema: { $ref: '#/components/schemas/HeroSlideUpdate' } } } }, responses: { 200: { description: 'OK' } } },
    delete: { tags: ['HeroSlides'], summary: 'Delete hero slide', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
  },

  // Stories
  '/api/stories': {
    get: { tags: ['Stories'], summary: 'List stories', parameters: [{ name: 'is_visible', in: 'query', schema: { type: 'boolean' } }], responses: { 200: { description: 'OK' } } },
    post: { tags: ['Stories'], summary: 'Create story', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/StoryCreate' } } } }, responses: { 201: { description: 'Created' } } },
  },
  '/api/stories/{id}': {
    parameters: [idParam],
    get: { tags: ['Stories'], summary: 'Get story', responses: { 200: { description: 'OK' } } },
    put: { tags: ['Stories'], summary: 'Update story', security: [{ bearerAuth: [] }], requestBody: { required: false, content: { 'application/json': { schema: { $ref: '#/components/schemas/StoryUpdate' } } } }, responses: { 200: { description: 'OK' } } },
    delete: { tags: ['Stories'], summary: 'Delete story', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
  },
  '/api/stories/{id}/story-cards': {
    parameters: [idParam],
    put: { tags: ['Stories'], summary: 'Add story card to story', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AddStoryCardRequest' } } } }, responses: { 200: { description: 'OK' } } },
  },
  '/api/stories/{id}/story-cards/{storyCardId}': {
    parameters: [idParam, { name: 'storyCardId', in: 'path', required: true, schema: { type: 'string' } }],
    delete: { tags: ['Stories'], summary: 'Remove story card from story', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
  },

  // Story Cards
  '/api/story-cards': {
    get: { tags: ['StoryCards'], summary: 'List story cards', responses: { 200: { description: 'OK' } } },
    post: { tags: ['StoryCards'], summary: 'Create story card', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/StoryCardCreate' } } } }, responses: { 201: { description: 'Created' } } },
  },
  '/api/story-cards/{id}': {
    parameters: [idParam],
    get: { tags: ['StoryCards'], summary: 'Get story card', responses: { 200: { description: 'OK' } } },
    put: { tags: ['StoryCards'], summary: 'Update story card', security: [{ bearerAuth: [] }], requestBody: { required: false, content: { 'application/json': { schema: { $ref: '#/components/schemas/StoryCardUpdate' } } } }, responses: { 200: { description: 'OK' } } },
    delete: { tags: ['StoryCards'], summary: 'Delete story card', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
  },

  // Attributes
  '/api/attributes': {
    get: { tags: ['Attributes'], summary: 'List attributes', responses: { 200: { description: 'OK' } } },
    post: { tags: ['Attributes'], summary: 'Create attribute', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AttributeCreate' } } } }, responses: { 201: { description: 'Created' } } },
  },
  '/api/attributes/{id}': {
    parameters: [idParam],
    get: { tags: ['Attributes'], summary: 'Get attribute', responses: { 200: { description: 'OK' } } },
    put: { tags: ['Attributes'], summary: 'Update attribute', security: [{ bearerAuth: [] }], requestBody: { required: false, content: { 'application/json': { schema: { $ref: '#/components/schemas/AttributeUpdate' } } } }, responses: { 200: { description: 'OK' } } },
    delete: { tags: ['Attributes'], summary: 'Delete attribute', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
  },

  // Analytics
  '/api/analytics': {
    get: { tags: ['Analytics'], summary: 'List analytics', security: [{ bearerAuth: [] }], parameters: [{ name: 'business_id', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    post: { tags: ['Analytics'], summary: 'Create analytic', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AnalyticsCreate' } } } }, responses: { 201: { description: 'Created' } } },
  },
  '/api/analytics/business/{businessId}': {
    parameters: [{ name: 'businessId', in: 'path', required: true, schema: { type: 'string' } }],
    get: { tags: ['Analytics'], summary: 'List analytics by business', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
  },
  '/api/analytics/{id}': {
    parameters: [idParam],
    get: { tags: ['Analytics'], summary: 'Get analytic', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    put: { tags: ['Analytics'], summary: 'Update analytic', security: [{ bearerAuth: [] }], requestBody: { required: false, content: { 'application/json': { schema: { $ref: '#/components/schemas/AnalyticsUpdate' } } } }, responses: { 200: { description: 'OK' } } },
    delete: { tags: ['Analytics'], summary: 'Delete analytic', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
  },
  '/api/analytics/{id}/views': {
    parameters: [idParam],
    put: { tags: ['Analytics'], summary: 'Increment views', responses: { 200: { description: 'OK' } } },
  },
  '/api/analytics/{id}/clicks': {
    parameters: [idParam],
    put: { tags: ['Analytics'], summary: 'Increment clicks', responses: { 200: { description: 'OK' } } },
  },

  // Health
  // Uploads
  '/api/uploads': {
    post: {
      tags: ['Uploads'],
      summary: 'Upload multiple files (images or videos)',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                files: { type: 'array', items: { type: 'string', format: 'binary' } },
              },
              required: ['files'],
              description: "Accepted file types: ['jpg','jpeg','png','gif','webp','mp4','mov','avi','webm']",
            },
          },
        },
      },
      responses: { 201: { description: 'Created' }, 400: { description: 'Bad request' } },
    },
  },
  '/api/health': {
    get: { tags: ['Health'], summary: 'Health check', responses: { 200: { description: 'OK' } } },
  },
});

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Site Snap API',
    version: pkg.version,
    description: 'Interactive API documentation for Site Snap backend',
  },
  servers: [
    { url: 'http://localhost:{port}', description: 'Local', variables: { port: { default: '3000' } } },
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Products' },
    { name: 'Categories' },
    { name: 'Sellers' },
    { name: 'Businesses' },
    { name: 'SiteDetails' },
    { name: 'HeroSlides' },
    { name: 'Stories' },
    { name: 'StoryCards' },
    { name: 'Attributes' },
    { name: 'Analytics' },
    { name: 'Uploads' },
    { name: 'Health' },
  ],
  components: {
    securitySchemes: { bearerAuth },
    schemas: {
      AuthRegisterRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
        required: ['email', 'password'],
      },
      AuthLoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      ProductCreate: {
        type: 'object',
        properties: {
          images: {
            type: 'array',
            items: { type: 'string', format: 'binary' },
            description: "Upload multiple files. Accepted types: ['jpg','jpeg','png','gif','webp','mp4','mov','avi','webm']"
          },
          product_name: { type: 'string', example: 'Cool T-Shirt' },
          product_descriptio: { type: 'string', example: 'A very cool t-shirt' },
          price: { type: 'number', example: 29.99 },
          is_visible: { type: 'boolean', default: true },
          inventory: { type: 'string', default: 'In Stock' },
          category_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          attribute_ids: { type: 'array', items: { type: 'string' }, example: ['507f1f77bcf86cd799439011'] },
        },
        required: ['product_name', 'price', 'category_id'],
      },
      ProductUpdate: {
        type: 'object',
        properties: {
          images: {
            type: 'array',
            items: { type: 'string', format: 'binary' },
            description: "Upload new images. Accepted types: ['jpg','jpeg','png','gif','webp','mp4','mov','avi','webm']"
          },
          imagesToKeep: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of existing image URLs to keep. Images not in this list will be deleted.',
            example: ['https://res.cloudinary.com/demo/image/upload/v1/products/image1.jpg']
          },
          product_name: { type: 'string', example: 'Cool T-Shirt' },
          product_descriptio: { type: 'string', example: 'A very cool t-shirt' },
          price: { type: 'number', example: 29.99 },
          is_visible: { type: 'boolean' },
          inventory: { type: 'string' },
          category_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          attribute_ids: { type: 'array', items: { type: 'string' }, example: ['507f1f77bcf86cd799439011'] },
        },
      },
      CategoryCreate: {
        type: 'object',
        properties: { category_name: { type: 'string' } },
        required: ['category_name'],
      },
      CategoryUpdate: { $ref: '#/components/schemas/CategoryCreate' },
      SellerCreate: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone_number: { type: 'number' },
          whatsapp_number: { type: 'number' },
          address: { type: 'string' },
        },
        required: ['name', 'phone_number', 'whatsapp_number', 'address'],
      },
      SellerUpdate: { $ref: '#/components/schemas/SellerCreate' },
      BusinessCreate: {
        type: 'object',
        properties: {
          business_name: { type: 'string' },
          business_tagline: { type: 'string' },
          business_email_add: { type: 'string', format: 'email' },
          site_id: { type: 'string' },
          seller_id: { type: 'string' },
          template_id: { type: 'number' },
        },
        required: ['business_name', 'business_email_add'],
      },
      BusinessUpdate: { $ref: '#/components/schemas/BusinessCreate' },
      SiteDetailsCreate: {
        type: 'object',
        properties: {
          site_name: { type: 'string' },
          site_tagline: { type: 'string' },
          site_url: { type: 'string' },
          hero_slide_ids: { type: 'array', items: { type: 'string' } },
          product_ids: { type: 'array', items: { type: 'string' } },
          story_ids: { type: 'array', items: { type: 'string' } },
          category_ids: { type: 'array', items: { type: 'string' } },
        },
        required: ['site_name', 'site_url'],
      },
      SiteDetailsUpdate: { $ref: '#/components/schemas/SiteDetailsCreate' },
      AddHeroSlideRequest: {
        type: 'object',
        properties: { hero_slide_id: { type: 'string' } },
        required: ['hero_slide_id'],
      },
      HeroSlideCreate: {
        type: 'object',
        properties: {
          tagline: { type: 'string' },
          image: { type: 'string' },
        },
        required: ['tagline', 'image'],
      },
      HeroSlideUpdate: { $ref: '#/components/schemas/HeroSlideCreate' },
      StoryCreate: {
        type: 'object',
        properties: {
          story_title: { type: 'string' },
          is_visible: { type: 'boolean' },
          story_card_ids: { type: 'array', items: { type: 'string' } },
        },
        required: ['story_title'],
      },
      StoryUpdate: { $ref: '#/components/schemas/StoryCreate' },
      AddStoryCardRequest: {
        type: 'object',
        properties: { story_card_id: { type: 'string' } },
        required: ['story_card_id'],
      },
      StoryCardCreate: {
        type: 'object',
        properties: {
          story_card_title: { type: 'string' },
          story_card_descript: { type: 'string' },
          story_card_image: { type: 'string' },
        },
        required: ['story_card_title', 'story_card_image'],
      },
      StoryCardUpdate: { $ref: '#/components/schemas/StoryCardCreate' },
      AttributeCreate: {
        type: 'object',
        properties: {
          attribute_name: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
        },
        required: ['attribute_name'],
      },
      AttributeUpdate: { $ref: '#/components/schemas/AttributeCreate' },
      AnalyticsCreate: {
        type: 'object',
        properties: {
          business_id: { type: 'string' },
          product_ids: { type: 'array', items: { type: 'string' } },
        },
        required: ['business_id'],
      },
      AnalyticsUpdate: { $ref: '#/components/schemas/AnalyticsCreate' },
    },
  },
  paths: buildPaths(),
};

module.exports = swaggerSpec;


