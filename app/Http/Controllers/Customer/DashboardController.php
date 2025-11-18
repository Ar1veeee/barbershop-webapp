<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $upcomingBookings = Booking::with(['barber', 'service'])
            ->where('customer_id', $user->id)
            ->upcoming()
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->limit(5)
            ->get();

        $stats = [
            'total_bookings' => Booking::where('customer_id', $user->id)->count(),
            'completed_bookings' => Booking::where('customer_id', $user->id)->completed()->count(),
            'upcoming_bookings' => Booking::where('customer_id', $user->id)->upcoming()->count(),
            'pending_reviews' => Booking::where('customer_id', $user->id)
                ->whereDoesntHave('review')
                ->completed()
                ->count(),
        ];

        return Inertia::render('Customer/Dashboard', [
            'upcomingBookings' => $upcomingBookings,
            'stats' => $stats,
        ]);
    }
}
