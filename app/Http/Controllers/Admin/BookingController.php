<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['customer', 'barber', 'service']);

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->date_from) {
            $query->whereDate('booking_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('booking_date', '<=', $request->date_to);
        }

        if ($request->barber_id) {
            $query->where('barber_id', $request->barber_id);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('customer', function ($customerQuery) use ($request) {
                    $customerQuery->where('name', 'like', '%' . $request->search . '%');
                })->orWhereHas('barber', function ($barberQuery) use ($request) {
                    $barberQuery->where('name', 'like', '%' . $request->search . '%');
                });
            });
        }

        $bookings = $query->orderBy('booking_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->paginate(15);

        $barbers = User::barbers()->get(['id', 'name']);

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'barbers' => $barbers,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'barber_id', 'search']),
        ]);
    }

    public function show(Booking $booking)
    {
        $booking->load(['customer', 'barber.barberProfile', 'service.category', 'review', 'transactions']);

        return Inertia::render('Admin/Bookings/Show', [
            'booking' => $booking,
        ]);
    }

    public function update(Request $request, Booking $booking)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,in_progress,completed,cancelled',
            'cancellation_reason' => 'nullable|string|max:500',
        ]);

        $booking->update([
            'status' => $request->status,
            'cancellation_reason' => $request->cancellation_reason,
            'cancelled_by' => $request->status === 'cancelled' ? auth()->id() : null,
        ]);

        return back()->with('success', 'Booking status updated successfully.');
    }
}
