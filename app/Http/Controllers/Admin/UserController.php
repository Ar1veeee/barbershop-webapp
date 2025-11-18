<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BarberProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->role && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%')
                    ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->with('barberProfile')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['role', 'status', 'search']),
        ]);
    }

    public function show(User $user)
    {
        $user->load(['barberProfile', 'customerBookings.service', 'barberBookings.customer']);

        $stats = [];

        if ($user->isBarber()) {
            $stats = [
                'total_bookings' => $user->barberBookings()->count(),
                'completed_bookings' => $user->barberBookings()->completed()->count(),
                'total_revenue' => $user->barberBookings()->completed()->sum('total_price'),
                'average_rating' => $user->barberProfile->rating_average,
            ];
        } elseif ($user->isCustomer()) {
            $stats = [
                'total_bookings' => $user->customerBookings()->count(),
                'completed_bookings' => $user->customerBookings()->completed()->count(),
                'total_spent' => $user->customerBookings()->completed()->sum('total_price'),
            ];
        }

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8',
            'role' => 'required|in:customer,barber,admin',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => $validated['status'],
        ]);

        if ($validated['role'] === 'barber') {
            BarberProfile::create([
                'user_id' => $user->id,
                'commission_rate' => 20,
                'is_available' => true,
            ]);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $user->update($validated);

        return back()->with('success', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'Cannot delete your own account']);
        }

        if ($user->role === 'admin') {
            return back()->withErrors(['error' => 'Cannot delete admin accounts']);
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully');
    }

    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password reset successfully');
    }
}
