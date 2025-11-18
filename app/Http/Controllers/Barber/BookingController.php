<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['customer', 'service'])
            ->where('barber_id', auth()->id());

        // Filters
        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from) {
            $query->whereDate('booking_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('booking_date', '<=', $request->date_to);
        }

        if ($request->search) {
            $query->whereHas('customer', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        $bookings = $query->orderBy('booking_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->paginate(15);

        return Inertia::render('Barber/Bookings/Index', [
            'bookings' => $bookings,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function show(Booking $booking)
    {
        if ($booking->barber_id !== auth()->id()) {
            abort(403);
        }

        $booking->load(['customer', 'service.category', 'review']);

        return Inertia::render('Barber/Bookings/Show', [
            'booking' => $booking,
        ]);
    }

    public function calendar(Request $request)
    {
        $month = $request->month ?? now()->month;
        $year = $request->year ?? now()->year;

        $bookings = Booking::with(['customer', 'service'])
            ->where('barber_id', auth()->id())
            ->whereMonth('booking_date', $month)
            ->whereYear('booking_date', $year)
            ->whereIn('status', ['pending', 'confirmed', 'in_progress', 'completed'])
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'title' => $booking->customer->name . ' - ' . $booking->service->name,
                    'start' => $booking->booking_date->format('Y-m-d') . ' ' . $booking->start_time,
                    'end' => $booking->booking_date->format('Y-m-d') . ' ' . $booking->end_time,
                    'status' => $booking->status,
                    'customer' => $booking->customer->name,
                    'service' => $booking->service->name,
                    'price' => $booking->total_price,
                ];
            });

        return Inertia::render('Barber/Bookings/Calendar', [
            'bookings' => $bookings,
            'month' => $month,
            'year' => $year,
        ]);
    }
}
