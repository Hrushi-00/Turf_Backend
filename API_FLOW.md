# Turf Backend API Flow

This backend is split into three layers:

1. Public discovery
2. Admin management
3. Business owner management
4. User booking and profile actions

## Auth Flow

### Admin

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `PATCH /api/auth/password`

### Business User

- `POST /api/business/auth/signup`
- `POST /api/business/auth/login`
- `GET /api/business/auth/profile`
- `PUT /api/business/auth/profile`
- `PATCH /api/business/auth/password`

Tokens are sent in:

```http
Authorization: Bearer <token>
```

### User

- `POST /api/users/signup`
- `POST /api/users/login`
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `PATCH /api/users/password`
- `DELETE /api/users/account`

## Turf Flow

### Public

- `GET /api/turfs`
- `GET /api/turfs/approved/list`
- `GET /api/turfs/featured`
- `GET /api/turfs/trending`
- `GET /api/turfs/:id`
- `GET /api/turfs/:id/availability`

### Admin

- `POST /api/turfs`
- `GET /api/turfs/admin/list`
- `PATCH /api/turfs/:id/meta`
- `PATCH /api/turfs/:id/approve`
- `PATCH /api/turfs/:id/reject`

### Business User

- `GET /api/business/turfs`
- `POST /api/business/turfs`
- `PUT /api/business/turfs/:id`
- `DELETE /api/business/turfs/:id`
- `GET /api/business/bookings`
- `PATCH /api/business/bookings/:id`
- `GET /api/business/bookings/stats`

## Booking Flow

### User

- `POST /api/bookings`
- `GET /api/bookings/me`
- `GET /api/bookings/:id`
- `PATCH /api/bookings/:id/cancel`

### Admin

- `GET /api/bookings/admin`
- `PATCH /api/bookings/:id`
- `GET /api/bookings/stats`
- `GET /api/bookings/all`

## Booking Lifecycle

1. Business user creates a turf.
2. Admin approves the turf.
3. Public users browse approved turfs.
4. User books a turf time slot.
5. Booking is linked to the user, turf, and business owner.
6. Business user or admin confirms or updates the booking status.
7. User can cancel their own booking.

## Notes

- Public turf APIs only return active and approved turfs.
- Booking creation blocks duplicate `date + timeSlot + turf` conflicts.
- User profile bookings are populated from the `bookings` array on the user document.
- New bookings increment turf booking counters for dashboard use.
- `SuperAdmin` is kept only as legacy compatibility in the auth model.
