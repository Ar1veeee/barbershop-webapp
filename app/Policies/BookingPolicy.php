<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Booking $booking): bool
    {
        return $user->isAdmin()
            || $user->id === $booking->customer_id
            || $user->id === $booking->barber_id;
    }

    public function create(User $user): bool
    {
        return $user->isCustomer();
    }

    public function update(User $user, Booking $booking): bool
    {
        return $user->isAdmin() || $user->id === $booking->barber_id;
    }

    public function delete(User $user, Booking $booking): bool
    {
        return $user->isAdmin();
    }

    public function cancel(User $user, Booking $booking): bool
    {
        if (method_exists($user, 'isAdmin') && $user->isAdmin()) {
            return true;
        }

        if ($user->id === $booking->customer_id) {
            $canCancel = $booking->canBeCancelled();
            return $canCancel;
        }

        return false;
    }

    public function review(User $user, Booking $booking): bool
    {
        return $user->id === $booking->customer_id && $booking->canBeReviewed();
    }

    public function updateStatus(User $user, Booking $booking): bool
    {
        return $user->isAdmin() || $user->id === $booking->barber_id;
    }
}
