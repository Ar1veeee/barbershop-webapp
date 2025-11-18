<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $user = auth()->user()->load('barberProfile');

        return Inertia::render('Barber/Profiles/Edit', [
            'user' => $user,
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'required|string|max:20',
            'bio' => 'nullable|string|max:1000',
            'specialization' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'bank_account' => 'nullable|string|max:255',
        ]);

        $user->name = $validated['name'];
        $user->phone = $validated['phone'];
        $user->email = $validated['email'];

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete('barber/' . $user->avatar);
            }

            $file = $request->file('avatar');
            $filename = time() . '_' . $file->getClientOriginalName();

            // Store file
            $file->storeAs('barber', $filename, 'public');

            $user->avatar = $filename;
        }

        $user->save();

        $user->barberProfile->update([
            'bio' => $validated['bio'] ?? null,
            'specialization' => $validated['specialization'] ?? null,
            'experience_years' => $validated['experience_years'] ?? 0,
            'bank_account' => $validated['bank_account'] ?? null,
        ]);

        return back()->with('success', 'Profiles updated successfully');
    }

    public function updateAvailability(Request $request)
    {
        $validated = $request->validate([
            'is_available' => 'required|boolean',
        ]);

        $user = auth()->user();

        if (!$user->barberProfile) {
            return response()->json(['message' => 'Barber profile not found'], 404);
        }

        $user->barberProfile->update([
            'is_available' => $validated['is_available'],
        ]);

        return back()->with([
            'success' => 'Availability updated successfully',
            'barber_profile' => $user->barberProfile->fresh(),
        ]);
    }
}
