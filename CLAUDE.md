# Haat-Bazar — Claude Context

## Who I Am
Adib (ihfaz297). CS student, new-ish to dev but learns fast. Comfortable with Node.js/Express/MongoDB. Java-familiar but Spring Boot is new. Not scared of code — just scared of time.

## The Project
**Haat-Bazar** — Cloud-based e-commerce system. SWE & Design Patterns course project. Team of 6. Deadline ~4 days from 2026-06-19.

The SRS, proposal, and class diagram are all already written and in this repo. The actual backend code lives in the **team repo: github.com/sedboisanjoy/haat-bazar** (I'm a collaborator).

## My Job
I am the **system architect**. My services to build (in Spring Boot/Java):
1. **Shopping Cart & Order Service** — cart CRUD, cart→order conversion, order lifecycle (PENDING→SHIPPED→DELIVERED), calls Inventory service to deduct stock on checkout
2. **Payment Gateway Service** — Strategy pattern for Card/Bkash/Nagad, notifies Order service on success
3. **Deployment** — Docker, NGINX reverse proxy (later, after services are built)

## Teammate's Work
- **Sajib (sedboisanjoy)** — Auth Service + Inventory Service. PR expected end of day 2026-06-19. Once his PR merges, I branch off main with `git checkout -b feature/cart-service`.

## Current State (as of 2026-06-26)
- Team repo (`haatbazar-backend/`) now has 6 scaffolded services: auth-service, product-service, eureka-server, api-gateway, order-service, payment-service.
- auth-service and product-service are fully implemented by teammates.
- order-service is Adib's — not started yet. payment-service is COMPLETE.
- Stack: Spring Boot 3.5.15, Java 17, MySQL (no H2), Eureka service discovery, OpenFeign for inter-service calls.
- Inventory is NOT a separate service — stock is a field on Product entity in product-service.
- Cart logic goes inside order-service (no separate cart-service).

## Payment Service (COMPLETE as of 2026-06-26)
All files in `haatbazar-backend/payment-service/`:
- `application.properties` — port 8083, payment_db, Eureka config
- `pom.xml` — OpenFeign added
- `PaymentServiceApplication.java` — @EnableFeignClients added
- `entity/PaymentMethod.java`, `PaymentStatus.java`, `Payment.java`
- `dto/PaymentRequest.java`, `PaymentResponse.java`
- `strategy/PaymentStrategy.java` — interface + Card/Bkash/Nagad impls
- `repository/PaymentRepository.java` — JpaRepository + findByOrderId
- `client/OrderServiceClient.java` — Feign stub to ORDER-SERVICE, calls PUT /api/orders/{orderId}/mark-paid
- `service/PaymentService.java` + `PaymentServiceImpl.java` — strategy selection, save, notify order
- `controller/PaymentController.java` — POST /api/payments, GET /api/payments/order/{orderId}
- Committed and pushed to `feature/payment-service` branch

## Architecture
- Microservices, each service is its own Spring Boot app
- Clean Architecture: Controller → Service → Repository
- NGINX API Gateway as reverse proxy (routing to services)
- JWT-based auth, RBAC (Customer / Seller / Admin)
- Inter-service calls via REST (RestTemplate or WebClient)

## Design Patterns Required by Course
- **Strategy** — Payment methods (Card, Bkash, Nagad)
- **Repository** — Spring Data JPA repositories
- **SOLID principles** throughout

## My Previous Relevant Work
I built a Node.js LMS backend (`D:\haat-bazar\lms-project-api\lms-backend`) with:
- JWT auth, bcrypt passwords
- Course enrollment flow with bank payment API integration
- Axios for inter-service HTTP calls

The payment service here is basically the same mental model — map Express patterns to Spring Boot equivalents.

## What to Focus On When Helping Me
- Map Spring Boot concepts to their Express equivalents I already know
- Don't over-explain REST/HTTP/JSON basics
- Prioritize getting working code fast over perfect architecture
- When I paste a PR or code, help me review it in context of this project
