<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, Booking $booking)
    {
        $this->authorize('review', $booking);

        if (!$booking->canBeReviewed()) {
            return back()->withErrors(['error' => 'This booking cannot be reviewed']);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'booking_id' => $booking->id,
            'customer_id' => auth()->id(),
            'barber_id' => $booking->barber_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        // Update barber rating
        $this->updateBarberRating($booking->barber_id);

        return back()->with('success', 'Thank you for your review!');
    }

    private function updateBarberRating($barberId)
    {
        $stats = Review::where('barber_id', $barberId)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total')
            ->first();

        $barberProfile = \App\Models\BarberProfile::where('user_id', $barberId)->first();
        if ($barberProfile) {
            $barberProfile->update([
                'rating_average' => round($stats->avg_rating, 2),
                'total_reviews' => $stats->total,
            ]);
        }
    }
}
