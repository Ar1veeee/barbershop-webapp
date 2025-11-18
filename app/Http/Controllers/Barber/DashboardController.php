<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $barberId = auth()->id();

        // Upcoming bookings (next 7 days)
        $upcomingBookings = Booking::with(['customer', 'service'])
            ->where('barber_id', $barberId)
            ->whereBetween('booking_date', [
                now()->toDateString(),
                now()->addDays(7)->toDateString()
            ])
            ->whereIn('status', ['pending', 'confirmed'])
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->limit(10)
            ->get();

        // Recent reviews
        $recentReviews = Review::with('customer')
            ->where('barber_id', $barberId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Statistics
        $stats = [
            'today_bookings' => Booking::where('barber_id', $barberId)
                ->whereDate('booking_date', today())
                ->count(),
            'pending_bookings' => Booking::where('barber_id', $barberId)
                ->where('status', 'pending')
                ->count(),
            'completed_today' => Booking::where('barber_id', $barberId)
                ->whereDate('booking_date', today())
                ->where('status', 'completed')
                ->count(),
            'earnings_today' => Booking::where('barber_id', $barberId)
                ->whereDate('booking_date', today())
                ->where('status', 'completed')
                ->sum('total_price'),
            'earnings_month' => Booking::where('barber_id', $barberId)
                ->whereMonth('booking_date', now()->month)
                ->whereYear('booking_date', now()->year)
                ->where('status', 'completed')
                ->sum('total_price'),
            'upcoming_bookings' => Booking::where('barber_id', $barberId)
                ->where('booking_date', '>=', now()->toDateString())
                ->whereIn('status', ['pending', 'confirmed'])
                ->count(),
            'total_customers' => Booking::where('barber_id', $barberId)
                ->distinct('customer_id')
                ->count('customer_id'),
            'average_rating' => Review::where('barber_id', $barberId)
                    ->avg('rating') ?? 0,
            'completion_rate' => $this->getCompletionRate($barberId),
            'monthly_target' => 10000000,
        ];

        return Inertia::render('Barber/Dashboard', [
            'stats' => $stats,
            'upcomingBookings' => $upcomingBookings,
            'recentReviews' => $recentReviews,
        ]);
    }

    private function getCompletionRate($barberId)
    {
        $thisMonth = Booking::where('barber_id', $barberId)
            ->whereMonth('booking_date', now()->month)
            ->whereYear('booking_date', now()->year)
            ->count();

        if ($thisMonth === 0) return 0;

        $completed = Booking::where('barber_id', $barberId)
            ->whereMonth('booking_date', now()->month)
            ->whereYear('booking_date', now()->year)
            ->where('status', 'completed')
            ->count();

        return ($completed / $thisMonth) * 100;
    }
}
