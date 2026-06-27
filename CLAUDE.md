# Haat-Bazar — Architecture & Integration Guide

## Team
| Person | Service | Status |
|---|---|---|
| Tonoy | product-service | Complete, merged to main |
| Sajib | auth-service | Complete, merged to main |
| Pitom | order-service | Complete, merged to main |
| Adib | payment-service | Complete, merged to main |
| Sanjoy | backup-service | Pending merge |
| Adib | eureka-server + api-gateway | Complete, on main |

## Services & Ports
| Service | Port | Database |
|---|---|---|
| eureka-server | 8761 | — |
| api-gateway | 8080 | — |
| auth-service | 8081 | auth_db |
| product-service | 8082 | product_db |
| payment-service | 8083 | payment_db |
| order-service | 8084 | haat_bazar_order |

## Startup Order
1. eureka-server (8761) — must be first, everything registers here
2. auth-service (8081)
3. product-service (8082)
4. order-service (8084)
5. payment-service (8083)
6. api-gateway (8080) — last

Verify all services appear at `http://localhost:8761` before testing.

## Running a Service
```bash
cd <service-folder>
mvn spring-boot:run
```
MySQL must be running with username `root` and password `root`. Databases are created automatically on first startup (`createDatabaseIfNotExist=true`).

## Shared JWT Secret (ALL services must use this)
```
HaatBazarSuperSecretKeyWhichIsAtLeast256BitsLongForSecurityPurpose
```
Set in each service's `application.properties`:
```properties
jwt.secret=HaatBazarSuperSecretKeyWhichIsAtLeast256BitsLongForSecurityPurpose
```

## API Endpoints

### auth-service (8081) — /api/auth
| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, returns JWT |

### product-service (8082) — /api/products + /api/inventory
| Method | Path | Description |
|---|---|---|
| GET | /api/products | List all products |
| POST | /api/products | Create product |
| GET | /api/products/{id} | Get product |
| GET | /api/inventory/{productId} | Check stock |
| PUT | /api/inventory/{productId}/reduce?quantity=N | Deduct stock |

### order-service (8084) — /api/cart + /api/orders
| Method | Path | Description |
|---|---|---|
| POST | /api/cart/{userId}/items | Add item to cart |
| GET | /api/cart/{userId} | Get cart |
| PUT | /api/cart/{userId}/items/{productId} | Update cart item |
| DELETE | /api/cart/{userId}/items/{productId} | Remove cart item |
| POST | /api/orders/checkout/{userId} | Checkout cart → creates order |
| GET | /api/orders/{id} | Get order |
| GET | /api/orders/user/{userId} | Get orders by user |
| PUT | /api/orders/{orderId}/mark-paid | Called by payment-service |

### payment-service (8083) — /api/payments
| Method | Path | Description |
|---|---|---|
| POST | /api/payments | Process payment (Card/Bkash/Nagad) |
| GET | /api/payments/order/{orderId} | Get payment by order |

## Inter-Service Calls

### order-service → product-service (inventory check + deduct)
```
GET http://localhost:8082/api/inventory/{productId}
PUT http://localhost:8082/api/inventory/{productId}/reduce?quantity=N
```
Response field is `quantity` (not `stock` or `availableQuantity`).

### payment-service → order-service (mark paid)
```
PUT http://localhost:8083/api/orders/{orderId}/mark-paid
```
Called via OpenFeign client using Eureka name `ORDER-SERVICE`.

## api-gateway Routes (8080)
All requests can go through `localhost:8080` instead of individual ports:
| Path prefix | Forwards to |
|---|---|
| /api/auth/** | AUTH-SERVICE |
| /api/products/** | PRODUCT-SERVICE |
| /api/inventory/** | PRODUCT-SERVICE |
| /api/orders/** | ORDER-SERVICE |
| /api/cart/** | ORDER-SERVICE |
| /api/payments/** | PAYMENT-SERVICE |

## Design Patterns
- **Strategy** — payment-service: `PaymentStrategy` interface with `CardPaymentStrategy`, `BkashPaymentStrategy`, `NagadPaymentStrategy`
- **Repository** — all services use Spring Data JPA repositories
- **SOLID** — Controller → Service → Repository layering throughout

## Tech Stack
- Spring Boot 3.5.15, Java 17
- Spring Cloud 2025.0.3 (Eureka, OpenFeign)
- MySQL (no H2)
- Spring Security + JWT (jjwt 0.11.5)
- Lombok

## Common Pitfalls
- `spring.application.name` must be UPPERCASE — Eureka load balancer uses it for routing
- All services must share the same JWT secret or token validation fails across services
- `target/` should never be committed — it's in `.gitignore`
- product-service inventory response field is `quantity` (not `stock` or `availableQuantity`)
- Start eureka-server first — services that start before it will fail to register
