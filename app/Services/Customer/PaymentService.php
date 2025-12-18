<?php

namespace App\Services\Customer;

use App\Models\Booking;
use App\Models\User;
use Midtrans\Config;
use Midtrans\Snap;

class PaymentService
{
    public function generateSnapToken(Booking $booking, User $user): string
    {
        if ($booking->payment_status !== 'unpaid' || in_array($booking->status, ['cancelled', 'completed'])) {
            return back()->withErrors(['error' => 'Booking cannot be paid']);
        }

        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;

        $booking->loadMissing(['barber.barberProfile', 'service']);

        $params = [
            'transaction_details' => [
                'order_id' => 'BOOKING-' . $booking->id,
                'gross_amount' => (int)$booking->total_price,
            ],
            'item_details' => [[
                'id' => $booking->service_id,
                'price' => (int)$booking->total_price,
                'quantity' => 1,
                'name' => $booking->service->name . ' with ' . $booking->barber->name,
            ]],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '08123456789',
            ],
            'expiry' => [
                'start_time' => now()->addMinutes(1)->format('Y-m-d H:i:s O'),
                'unit' => 'hour',
                'duration' => 1,
            ],
        ];

        $snapToken = Snap::getSnapToken($params);

        return $snapToken;
    }
}
