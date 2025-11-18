<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Booking;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\BarberProfile;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->period ?? 'month';

        // Overview Statistics
        $stats = [
            'total_customers' => User::customers()->count(),
            'total_barbers' => User::barbers()->count(),
            'total_bookings' => Booking::count(),
            'total_revenue' => Booking::where('status', 'completed')->sum('total_price'),
        ];

        // Period-based statistics
        $periodStats = $this->getPeriodStats($period);

        // Recent bookings
        $recentBookings = Booking::with(['customer', 'barber', 'service'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Top barbers
        $topBarbers = User::barbers()
            ->withCount(['barberBookings as completed_bookings' => function ($query) {
                $query->where('status', 'completed');
            }])
            ->with('barberProfile')
            ->having('completed_bookings', '>', 0)
            ->orderByDesc('completed_bookings')
            ->limit(5)
            ->get();

        // Bookings status distribution
        $bookingsByStatus = Booking::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // Revenue trend
        $revenueTrend = $this->getRevenueTrend($period);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'periodStats' => $periodStats,
            'recentBookings' => $recentBookings,
            'topBarbers' => $topBarbers,
            'bookingsByStatus' => $bookingsByStatus,
            'revenueTrend' => $revenueTrend,
            'period' => $period,
        ]);
    }

    private function getPeriodStats($period)
    {
        $query = Booking::query();

        switch ($period) {
            case 'day':
                $query->whereDate('booking_date', today());
                break;
            case 'week':
                $query->whereBetween('booking_date', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('booking_date', now()->month)
                    ->whereYear('booking_date', now()->year);
                break;
            case 'year':
                $query->whereYear('booking_date', now()->year);
                break;
        }

        return [
            'bookings' => $query->count(),
            'revenue' => $query->where('status', 'completed')->sum('total_price'),
            'completed' => $query->where('status', 'completed')->count(),
            'cancelled' => $query->where('status', 'cancelled')->count(),
        ];
    }

    private function getRevenueTrend($period)
    {
        $query = Booking::where('status', 'completed');

        switch ($period) {
            case 'day':
                return $query->whereDate('booking_date', today())
                    ->select(
                        DB::raw('HOUR(start_time) as hour'),
                        DB::raw('SUM(total_price) as revenue')
                    )
                    ->groupBy('hour')
                    ->orderBy('hour')
                    ->get();

            case 'week':
                return $query->whereBetween('booking_date', [now()->startOfWeek(), now()->endOfWeek()])
                    ->select(
                        DB::raw('DATE(booking_date) as date'),
                        DB::raw('SUM(total_price) as revenue')
                    )
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get();

            case 'month':
                return $query->whereMonth('booking_date', now()->month)
                    ->whereYear('booking_date', now()->year)
                    ->select(
                        DB::raw('DAY(booking_date) as day'),
                        DB::raw('SUM(total_price) as revenue')
                    )
                    ->groupBy('day')
                    ->orderBy('day')
                    ->get();

            case 'year':
                return $query->whereYear('booking_date', now()->year)
                    ->select(
                        DB::raw('MONTH(booking_date) as month'),
                        DB::raw('SUM(total_price) as revenue')
                    )
                    ->groupBy('month')
                    ->orderBy('month')
                    ->get();
        }
    }
}
