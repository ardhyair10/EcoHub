# Project Context: Eco Hub (ITechno Cup 2026)

## 1. Project Overview
**Eco Hub** is a Smart Sustainable Circular Economy Platform built for the ITechno Cup 2026 Web Development competition. It addresses SDGs 7, 8, 9, and 11 by providing an end-to-end digital ecosystem connecting households, local drop-off points (RT/RW), and B2B recycling industries.

**Target Deadline:** September 6, 2026. 
**Architecture Standard:** Enterprise-grade, clean architecture, highly optimized, production-ready, and deployable on zero-cost infrastructure for live demos.

---

## 2. Tech Stack & Infrastructure
*   **Frontend:** Next.js (App Router) + TailwindCSS + Shadcn UI (Hosted on Vercel).
*   **Backend:** Node.js + Express.js (Hosted on Render).
*   **Database:** PostgreSQL (Hosted on Supabase).
*   **ORM/Query Builder:** Prisma ORM or Supabase Client.
*   **Media Storage:** Cloudinary (via Multer/Cloudinary API).
*   **AI Integration:** OpenAI/Gemini API (Strictly for Educational Smart CS).

---

## 3. Database Schema (ERD)

### `users`
*   `id` (UUID, PK)
*   `name` (String)
*   `email` (String, Unique)
*   `password_hash` (String)
*   `role` (Enum: `CITIZEN`, `ADMIN_RW`, `B2B_BUYER`)
*   `eco_points` (Integer, Default: 0)
*   `qr_code_id` (String, Unique)
*   `created_at` (Timestamp)

### `waste_categories`
*   `id` (UUID, PK)
*   `name` (String) - e.g., "Plastik PET", "Kardus", "Besi"
*   `point_per_kg` (Integer)
*   `created_at` (Timestamp)

### `drop_off_transactions` (Core Logistics)
*   `id` (UUID, PK)
*   `citizen_id` (UUID, FK -> users.id)
*   `admin_id` (UUID, FK -> users.id)
*   `waste_category_id` (UUID, FK -> waste_categories.id)
*   `weight_kg` (Decimal/Float)
*   `points_awarded` (Integer)
*   `created_at` (Timestamp)

### `products` (Eco-Commerce)
*   `id` (UUID, PK)
*   `seller_id` (UUID, FK -> users.id)
*   `name` (String)
*   `description` (Text)
*   `price_idr` (Integer)
*   `max_point_discount` (Integer) - Max points a user can use for this item
*   `eco_badge_desc` (String) - e.g., "Saves 2kg of plastic"
*   `image_url` (String) - Cloudinary URL
*   `stock` (Integer)

### `orders` (E-Commerce Transactions)
*   `id` (UUID, PK)
*   `buyer_id` (UUID, FK -> users.id)
*   `product_id` (UUID, FK -> products.id)
*   `points_used` (Integer)
*   `final_price_idr` (Integer)
*   `status` (Enum: `PENDING`, `COMPLETED`)
*   `created_at` (Timestamp)

### `events` (Volunteer Hub)
*   `id` (UUID, PK)
*   `title` (String)
*   `location` (String)
*   `date` (Timestamp)
*   `reward_points` (Integer)
*   `banner_url` (String)

### `event_participants`
*   `id` (UUID, PK)
*   `event_id` (UUID, FK -> events.id)
*   `citizen_id` (UUID, FK -> users.id)
*   `status` (Enum: `REGISTERED`, `ATTENDED`) - Updates to ATTENDED upon QR scan.

---

## 4. Expected RESTful API Endpoints

### Auth & Users
*   `POST /api/auth/register` - Register user & generate QR ID.
*   `POST /api/auth/login` - Authenticate & return JWT.
*   `GET /api/users/me` - Fetch profile, points, and QR ID.

### Drop-off (Logistics)
*   `GET /api/categories` - Get waste categories & point rates.
*   `POST /api/transactions/scan` - Admin scans Citizen QR & submits waste data. Automatically calculates `weight * point_per_kg` and updates Citizen's `eco_points`.
*   `GET /api/transactions/leaderboard` - Group points by RW/Area for gamification.

### Eco-Commerce
*   `GET /api/products` - Fetch marketplace catalog.
*   `POST /api/orders` - Checkout. Must validate if `buyer.eco_points >= points_used`, deduct points, and calculate final price.

### Volunteer Hub
*   `GET /api/events` - Fetch upcoming events.
*   `POST /api/events/:id/join` - RSVP to an event.
*   `POST /api/events/attendance` - Admin scans participant's QR to mark as `ATTENDED` and credit `reward_points`.

### AI Eco-Assistant
*   `POST /api/chat` - Sends user prompt to LLM. 
    *   *System Prompt injection:* "You are an educational assistant for Eco Hub. Only answer questions related to waste sorting, recycling impact, and recommending upcycled products. Do not answer general queries."

---

## 5. UI/UX & User Flows

1.  **Dashboard Warga (Citizen):** Shows Current Points, QR Code Modal (for easy scanning), Recent Transactions, and Leaderboard.
2.  **Dashboard Admin RW:** Contains a "Scan Scanner" interface (integrating a web-based QR reader package), form to input waste weight, and transaction history.
3.  **Eco-Commerce Page:** Standard marketplace grid. Product details show the "Eco-Badge". Checkout modal includes a slider to apply Eco-Points for discounts.
4.  **Volunteer Page:** List of events with "RSVP" buttons.

---

## 6. AI Agent Directives & Strict Rules
When writing code for this project, the AI MUST adhere to:
1.  **Zero Hardware:** Do not suggest or write code for IoT, GPS routing, or physical camera hardware integrations. Stick strictly to Web QR scanning and CRUD logic.
2.  **Clean Code:** Use modular controllers, routes, and services in Node.js. In Next.js, utilize server components where possible to optimize load times.
3.  **Error Handling:** Implement robust `try-catch` blocks. Return standardized JSON responses: `{ success: boolean, data: any, message: string }`.
4.  **Cold Start Optimization:** Write lightweight endpoints. Avoid heavy startup scripts in the Node.js backend to accommodate Render's free tier spin-up time.