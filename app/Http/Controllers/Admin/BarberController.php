<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BarberController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('barberProfile')
            ->barbers();

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->availability && $request->availability !== 'all') {
            $available = $request->availability === 'available';
            $query->whereHas('barberProfile', function ($q) use ($available) {
                $q->where('is_available', $available);
            });
        }

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $barbers = $query->withCount('barberBookings')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Barbers/Index', [
            'barbers' => $barbers,
            'filters' => $request->only(['status', 'availability', 'search']),
        ]);
    }

    public function updateCommission(Request $request, User $user)
    {
        if (!$user->isBarber()) {
            return back()->withErrors(['error' => 'User is not a barber']);
        }

        $validated = $request->validate([
            'commission_rate' => 'required|numeric|min:0|max:100',
        ]);

        $user->barberProfile->update([
            'commission_rate' => $validated['commission_rate'],
        ]);

        return back()->with('success', 'Commission rate updated successfully');
    }
}
