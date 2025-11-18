<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BarberSchedule;
use App\Models\BarberTimeOff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $barbers = User::where('role', 'barber')
            ->where('status', 'active')
            ->with('barberProfile')
            ->get(['id', 'name', 'email']);

        $selectedBarberId = $request->get('barber_id', $barbers->first()->id ?? null);

        $schedules = BarberSchedule::where('barber_id', $selectedBarberId)
            ->orderBy('day_of_week')
            ->get();

        $timeOff = BarberTimeOff::where('barber_id', $selectedBarberId)
            ->where('end_date', '>=', now()->toDateString())
            ->orderBy('start_date')
            ->get();

        return Inertia::render('Admin/Schedules/Index', [
            'barbers' => $barbers,
            'selectedBarber' => $selectedBarberId,
            'schedules' => $schedules,
            'timeOff' => $timeOff,
        ]);
    }

    public function updateSchedule(Request $request)
    {
        $validated = $request->validate([
            'barber_id' => 'required|exists:users,id',
            'schedules' => 'required|array',
            'schedules.*.day_of_week' => 'required|integer|min:0|max:6',
            'schedules.*.is_available' => 'required|boolean',
            'schedules.*.start_time' => [
                'nullable',
                'required_if:schedules.*.is_available,true',
            ],
            'schedules.*.end_time' => [
                'nullable',
                'required_if:schedules.*.is_available,true',
                'after:schedules.*.start_time',
            ],
        ]);

        DB::transaction(function () use ($validated) {
            BarberSchedule::where('barber_id', $validated['barber_id'])->delete();

            foreach ($validated['schedules'] as $schedule) {
                if ($schedule['is_available']) {
                    BarberSchedule::create([
                        'barber_id' => $validated['barber_id'],
                        'day_of_week' => $schedule['day_of_week'],
                        'start_time' => $schedule['start_time'],
                        'end_time' => $schedule['end_time'],
                        'is_available' => true,
                    ]);
                }
            }
        });

        return back()->with('success', 'Schedule updated successfully');
    }

    public function storeTimeOff(Request $request)
    {
        $validated = $request->validate([
            'barber_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:500',
        ]);

        $overlap = BarberTimeOff::where('barber_id', $validated['barber_id'])
            ->where(function ($query) use ($validated) {
                $query->whereBetween('start_date', [$validated['start_date'], $validated['end_date']])
                    ->orWhereBetween('end_date', [$validated['start_date'], $validated['end_date']])
                    ->orWhere(function ($q) use ($validated) {
                        $q->where('start_date', '<=', $validated['start_date'])
                            ->where('end_date', '>=', $validated['end_date']);
                    });
            })
            ->exists();

        if ($overlap) {
            return back()->withErrors(['start_date' => 'Time off period overlaps with existing time off']);
        }

        BarberTimeOff::create([
            'barber_id' => $validated['barber_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'],
        ]);

        return back()->with('success', 'Time off added successfully');
    }

    public function deleteTimeOff(BarberTimeOff $timeOff)
    {
        $timeOff->delete();
        return back()->with('success', 'Time off deleted successfully');
    }
}
