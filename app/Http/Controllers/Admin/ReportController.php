<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->type ?? 'revenue';
        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->endOfMonth()->toDateString();

        $data = match ($type) {
            'revenue' => $this->getRevenueReport($startDate, $endDate),
            'bookings' => $this->getBookingsReport($startDate, $endDate),
            'barbers' => $this->getBarbersReport($startDate, $endDate),
            'services' => $this->getServicesReport($startDate, $endDate),
            default => $this->getRevenueReport($startDate, $endDate),
        };

        return Inertia::render('Admin/Reports/Index', [
            'type' => $type,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'data' => $data,
        ]);
    }

    private function getRevenueReport($startDate, $endDate)
    {
        return [
            'total' => Booking::whereBetween('booking_date', [$startDate, $endDate])
                ->where('status', 'completed')
                ->sum('total_price'),
            'by_day' => Booking::whereBetween('booking_date', [$startDate, $endDate])
                ->where('status', 'completed')
                ->select(
                    DB::raw('DATE(booking_date) as date'),
                    DB::raw('SUM(total_price) as revenue'),
                    DB::raw('COUNT(*) as bookings')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'by_barber' => Booking::whereBetween('booking_date', [$startDate, $endDate])
                ->where('bookings.status', 'completed')
                ->join('users', 'bookings.barber_id', '=', 'users.id')
                ->select(
                    'users.name',
                    DB::raw('SUM(bookings.total_price) as revenue'),
                    DB::raw('COUNT(*) as bookings')
                )
                ->groupBy('users.id', 'users.name')
                ->orderByDesc('revenue')
                ->get(),
            'by_status' => [],
            'by_service' => [],
        ];
    }

    private function getBookingsReport($startDate, $endDate)
    {
        return [
            'total' => Booking::whereBetween('booking_date', [$startDate, $endDate])->count(),
            'by_status' => Booking::whereBetween('booking_date', [$startDate, $endDate])
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get(),
            'by_service' => Booking::whereBetween('booking_date', [$startDate, $endDate])
                ->join('services', 'bookings.service_id', '=', 'services.id')
                ->select('services.name', DB::raw('COUNT(*) as count'))
                ->groupBy('services.id', 'services.name')
                ->orderByDesc('count')
                ->get(),
            'by_day' => [],
            'by_barber' => [],
        ];
    }

    private function getBarbersReport($startDate, $endDate)
    {
        return User::barbers()
            ->withCount(['barberBookings as total_bookings' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('booking_date', [$startDate, $endDate]);
            }])
            ->withCount(['barberBookings as completed_bookings' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('booking_date', [$startDate, $endDate])
                    ->where('status', 'completed');
            }])
            ->with(['barberBookings' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('booking_date', [$startDate, $endDate])
                    ->where('status', 'completed')
                    ->select('barber_id', DB::raw('SUM(total_price) as revenue'))
                    ->groupBy('barber_id');
            }])
            ->with('barberProfile')
            ->get();
    }

    private function getServicesReport($startDate, $endDate)
    {
        return Service::withCount(['bookings as total_bookings' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('booking_date', [$startDate, $endDate]);
        }])
            ->with(['bookings' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('booking_date', [$startDate, $endDate])
                    ->where('status', 'completed')
                    ->select('service_id', DB::raw('SUM(total_price) as revenue'))
                    ->groupBy('service_id');
            }])
            ->with('category')
            ->orderByDesc('total_bookings')
            ->get();
    }
}
