<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BarberController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['barberProfile', 'receivedReviews'])
            ->barbers()
            ->active()
            ->whereHas('barberProfile', function ($q) {
                $q->where('is_available', true);
            });

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->service_id) {
            $query->whereHas('barberProfile.services', function ($q) use ($request) {
                $q->where('services.id', $request->service_id)
                    ->where('barber_services.is_available', true);
            });
        }

        $barbers = $query->paginate(12);
        $services = Service::active()->get();

        return Inertia::render('Customer/Barbers/Index', [
            'barbers' => $barbers,
            'services' => $services,
            'filters' => $request->only(['search', 'service_id']),
        ]);
    }

    public function show(User $user)
    {
        if (!$user->isBarber()) {
            abort(404);
        }

        if (!$user->barberProfile) {
            abort(404, 'Barber profile not found');
        }

        $user->load([
            'barberProfile.services.category',
            'receivedReviews.customer',
            'barberProfile.schedules',
        ]);

        $user->barberProfile->services = $user->barberProfile->services->map(function ($service) {
            return [
                'id' => $service->id,
                'name' => $service->name,
                'duration' => $service->duration,
                'base_price' => $service->base_price,
                'category' => $service->category,
                'pivot' => [
                    'custom_price' => $service->pivot->custom_price ?? $service->base_price,
                ],
            ];
        });

        return Inertia::render('Customer/Barbers/Show', [
            'barber' => $user,
        ]);
    }

    public function availableSlots(User $user, Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'service_id' => 'required|exists:services,id',
        ]);

        $service = Service::findOrFail($request->service_id);
        $date = \Carbon\Carbon::parse($request->date);
        $dayOfWeek = $date->dayOfWeek;

        // Get barber schedule for this day
        $schedule = \App\Models\BarberSchedule::where('barber_id', $user->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->first();

        if (!$schedule) {
            return response()->json(['slots' => []]);
        }

        // Get existing bookings
        $bookings = Booking::where('barber_id', $user->id)
            ->where('booking_date', $date->toDateString())
            ->where('status', '!=', 'cancelled')
            ->get(['start_time', 'end_time']);

        // Generate time slots
        $slots = [];
        $current = \Carbon\Carbon::parse($schedule->start_time);
        $end = \Carbon\Carbon::parse($schedule->end_time);

        while ($current->lt($end)) {
            $slotEnd = $current->copy()->addMinutes($service->duration);

            if ($slotEnd->lte($end)) {
                $isAvailable = true;

                foreach ($bookings as $booking) {
                    $bookingStart = \Carbon\Carbon::parse($booking->start_time);
                    $bookingEnd = \Carbon\Carbon::parse($booking->end_time);

                    if ($current->lt($bookingEnd) && $slotEnd->gt($bookingStart)) {
                        $isAvailable = false;
                        break;
                    }
                }

                $slots[] = [
                    'time' => $current->format('H:i'),
                    'available' => $isAvailable,
                ];
            }

            $current->addMinutes(30); // 30 minute intervals
        }

        return response()->json(['slots' => $slots]);
    }
}
