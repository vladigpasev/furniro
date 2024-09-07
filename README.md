
# Furniro Backend API

Welcome to the backend API of **Furniro**, a web application for browsing, comparing, and purchasing furniture. This API is built using [NestJS](https://nestjs.com/), a progressive Node.js framework for building efficient, reliable, and scalable server-side applications.

## Hosted API

The API is hosted at:  
**[https://api.furniro.averite.org](https://api.furniro.averite.org)**

## Table of Contents

- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [License](#license)

## Getting Started

To get the project running locally, follow the instructions below.

### Prerequisites

- Node.js v18 or higher
- npm (Node Package Manager)
- MongoDB (as the database)
- AWS S3 credentials for image uploads (if needed)
- Stripe account for payment integration

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vladigpasev/furniro.git
   cd furniro
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file at the root of the project and provide the necessary environment variables:

   ```plaintext
   MONGO_URL=
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_REGION=
   S3_BUCKET_NAME=
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   FRONTEND_SUCCESS_URL=
   FRONTEND_CANCEL_URL=

   SMTP_HOST=
   SMTP_PORT=
   SMTP_USER=
   SMTP_PASS=
   ```

4. Start the application:

   ```bash
   npm run start:dev
   ```

5. Access the Swagger API documentation at:

   ```
   http://localhost:3000/api
   ```

## API Endpoints

### Products

- `POST /api/products`  
  Create a new product.
  
- `GET /api/products`  
  Get all products with filtering, sorting, and pagination.

- `GET /api/products/{id}`  
  Get a product by its ID.

- `PATCH /api/products/{id}`  
  Update a product by its ID (Partial Update).

- `DELETE /api/products/{id}`  
  Delete a product by its ID.

### Categories

- `POST /api/categories`  
  Create a new category.
  
- `GET /api/categories`  
  Get all categories.

- `GET /api/categories/{id}`  
  Get a category by its ID.

- `PATCH /api/categories/{id}`  
  Update a category by its ID.

- `DELETE /api/categories/{id}`  
  Delete a category by its ID.

### Reviews

- `POST /api/reviews`  
  Create a new review for a product.

- `GET /api/reviews/product/{productId}`  
  Get all reviews for a product.

- `DELETE /api/reviews/{id}`  
  Delete a review by its ID.

### Image Upload

- `POST /api/upload`  
  Upload multiple images to AWS S3 with dynamic sizes.

### Mail Offers

- `POST /api/mail-offers`  
  Create a new email subscription.

- `DELETE /api/mail-offers/{email}`  
  Unsubscribe an email from the list.

### Orders

- `GET /api/orders`  
  Retrieve all orders.

- `GET /api/orders/{id}`  
  Get an order by its ID.

- `DELETE /api/orders/{id}`  
  Delete an order by its ID.

### Payment

- `POST /api/stripe/create-checkout-session`  
  Create a Stripe Checkout session.

- `POST /api/stripe/webhook`  
  Handle Stripe webhook events.

### Feedback

- `POST /api/feedback`  
  Submit customer feedback.

- `GET /api/feedback`  
  Retrieve all feedback.

- `PATCH /api/feedback/{id}/archive`  
  Archive feedback.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: TypeScript
- **Database**: MongoDB (with Mongoose ODM)
- **File Storage**: AWS S3 for image uploads
- **Payments**: Stripe for secure payment integration
- **Authentication**: JWT (JSON Web Token)
- **Email Service**: Nodemailer and Mailchimp (for sending newsletters and feedback emails)
- **Documentation**: Swagger (API Documentation)

## License

This project is licensed under the MIT License