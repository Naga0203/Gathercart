# Feature Inventory

Based on the project description ("Neighbourhood group-buying grocery app for India") and the 9-phase development plan in Prompts.txt, here are the identified features.

## Core MVP Features (Must Have)

### 1. Product Management
- Product listing with categories
- Product detail view
- Product search and filtering
- Product availability status
- Price display (regular + group price)
- Product images

### 2. Group Buying (Core Differentiator)
- Create a group purchase
- Join existing group purchase
- View group details and progress
- Track participant quantities
- Group deadline/countdown
- Group status management (Open, Filled, Closed, Cancelled)
- Minimum quantity requirements
- Group price calculation (bulk discount)

### 3. Cart Management
- Add/remove products
- Update quantities
- View cart with price breakdown
- Subtotal calculation
- Estimated savings from group buying
- Final total calculation
- Empty cart state
- Cart persistence

### 4. Authentication & Authorization
- User registration (email/password)
- User login/logout
- JWT token management
- Role-based access (CUSTOMER, ADMIN)
- Protected routes
- Session management
- Password hashing (BCrypt)

---

## Supporting Features

### 5. User Profile
- Profile view/edit
- Order history
- Saved addresses
- Notification preferences

### 6. Address Management
- Add/edit/delete addresses
- Default address selection
- Address validation

### 7. Order Management
- Order creation from cart
- Order tracking
- Order history
- Order details
- Payment proof upload (per Prompts.txt M4)

### 8. Notifications
- Group status updates
- Deadline reminders
- Order confirmations
- In-app notification center

---

## Administrative Features

### 9. Admin Dashboard
- Product management (CRUD)
- Group purchase oversight
- User management
- Order management
- Analytics/dashboard summaries

---

## Future Enhancements (Post-MVP)

### 10. Advanced Features
- Payment gateway integration
- Email/SMS notifications
- Image upload for products
- Rating and reviews
- Referral system
- Loyalty points
- Multi-language support (Indian languages)
- PWA/offline support
- Rate limiting and abuse prevention

---

## Feature Dependencies

```
┌─────────────────┐
│  Authentication │◄──┐
└────────┬────────┘   │
         │            │
         ▼            │
┌─────────────────┐   │
│  Product Mgmt   │───┘
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────────┐
│  Cart  │ │ Group Buying │
└────┬───┘ └──────┬───────┘
     │            │
     └─────┬──────┘
           ▼
    ┌────────────┐
    │   Orders   │
    └────────────┘
           │
           ▼
    ┌────────────┐
    │  Profile/  │
    │  Addresses │
    └────────────┘
```

## Feature Priority Order (per Prompts.txt Phases)

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Project Initialization & Architecture | Pending |
| 2 | UI Foundation, Shell & Theme | Pending |
| 3 | Product Management & Discovery | Pending |
| 4 | Group Buying & Participation | Pending |
| 5 | Cart Management & Pricing | Pending |
| 6 | Order Management | Pending |
| 7 | Authentication & Authorization | Pending |
| 8 | Additional Features | Pending |
| 9 | Integration Testing & Stabilization | Pending |

---

## Missing Information Needed

1. **Group buying rules**: Minimum quantities, deadline duration, price calculation formula
2. **User roles**: Exact permissions for CUSTOMER vs ADMIN
3. **Payment flow**: Real payments or mock? Payment proof requirements?
4. **Categories**: Product category hierarchy
5. **Delivery/Pickup**: How orders are fulfilled
6. **Notifications**: Channels (push, email, SMS, in-app)
7. **Geographic scope**: Single neighborhood, city-wide, multi-city?