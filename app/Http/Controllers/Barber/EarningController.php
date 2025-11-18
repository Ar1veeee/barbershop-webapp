<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EarningController extends Controller
{
    public function index(Request $request)
    {
        $barberId = auth()->id();
        $year = $request->year ?? now()->year;
        $month = $request->month ?? now()->month;

        // Monthly earnings
        $monthlyEarnings = Booking::where('barber_id', $barberId)
            ->where('status', 'completed')
            ->whereMonth('booking_date', $month)
            ->whereYear('booking_date', $year)
            ->sum('total_price');

        // Get barber commission rate
        $commissionRate = auth()->user()->barberProfile->commission_rate;
        $commission = $monthlyEarnings * ($commissionRate / 100);
        $netEarnings = $monthlyEarnings - $commission;

        // Daily earnings for the month
        $dailyEarnings = Booking::where('barber_id', $barberId)
            ->where('status', 'completed')
            ->whereMonth('booking_date', $month)
            ->whereYear('booking_date', $year)
            ->select(
                DB::raw('DAY(booking_date) as day'),
                DB::raw('SUM(total_price) as earnings'),
                DB::raw('COUNT(*) as bookings')
            )
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // Top services
        $topServices = Booking::where('barber_id', $barberId)
            ->where('status', 'completed')
            ->whereMonth('booking_date', $month)
            ->whereYear('booking_date', $year)
            ->join('services', 'bookings.service_id', '=', 'services.id')
            ->select(
                'services.name',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(bookings.total_price) as revenue')
            )
            ->groupBy('services.id', 'services.name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        // Recent completed bookings
        $recentBookings = Booking::with(['customer', 'service'])
            ->where('barber_id', $barberId)
            ->where('status', 'completed')
            ->whereMonth('booking_date', $month)
            ->whereYear('booking_date', $year)
            ->orderBy('booking_date', 'desc')
            ->limit(10)
            ->get();

        // Comparison with last month
        $lastMonthEarnings = Booking::where('barber_id', $barberId)
            ->where('status', 'completed')
            ->whereMonth('booking_date', $month == 1 ? 12 : $month - 1)
            ->whereYear('booking_date', $month == 1 ? $year - 1 : $year)
            ->sum('total_price');

        $growthRate = $lastMonthEarnings > 0
            ? (($monthlyEarnings - $lastMonthEarnings) / $lastMonthEarnings) * 100
            : 0;

        // Peak hours analysis
        $peakHours = Booking::where('barber_id', $barberId)
            ->where('status', 'completed')
            ->whereMonth('booking_date', $month)
            ->whereYear('booking_date', $year)
            ->select(
                DB::raw('HOUR(start_time) as hour'),
                DB::raw('COUNT(*) as bookings'),
                DB::raw('SUM(total_price) as revenue')
            )
            ->groupBy('hour')
            ->orderByDesc('bookings')
            ->limit(3)
            ->get();

        // Customer retention
        $returningCustomers = Booking::where('barber_id', $barberId)
            ->whereMonth('booking_date', $month)
            ->whereYear('booking_date', $year)
            ->select('customer_id')
            ->groupBy('customer_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();

        $totalCustomers = Booking::where('barber_id', $barberId)
            ->whereMonth('booking_date', $month)
            ->whereYear('booking_date', $year)
            ->distinct('customer_id')
            ->count('customer_id');

        $retentionRate = $totalCustomers > 0 ? ($returningCustomers / $totalCustomers) * 100 : 0;

        return Inertia::render('Barber/Earnings/Index', [
            'monthlyEarnings' => $monthlyEarnings,
            'commission' => $commission,
            'netEarnings' => $netEarnings,
            'commissionRate' => $commissionRate,
            'dailyEarnings' => $dailyEarnings,
            'topServices' => $topServices,
            'recentBookings' => $recentBookings,
            'month' => $month,
            'year' => $year,
            'growthRate' => $growthRate,
            'peakHours' => $peakHours,
            'retentionRate' => $retentionRate,
            'lastMonthEarnings' => $lastMonthEarnings,
        ]);
    }
}
