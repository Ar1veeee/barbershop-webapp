<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;

class PaymentController extends Controller
{
    public function notificationHandler(Request $request)
    {
        $payload = $request->all();

        $signatureKey = hash(
            'sha512',
            $payload['order_id'] .
                $payload['status_code'] .
                $payload['gross_amount'] .
                env('MIDTRANS_SERVER_KEY')
        );

        if ($signatureKey !== $payload['signature_key']) {
            return response('Invalid signature', 403);
        }

        $orderId = $payload['order_id'];
        $bookingId = str_replace('BOOKING-', '', $orderId);
        $booking = Booking::find($bookingId);

        if (!$booking) {
            return response('Booking not found', 404);
        }

        $transactionStatus = $payload['transaction_status'];
        $fraudStatus = $payload['fraud_status'] ?? null;

        if ($transactionStatus === 'settlement' || $transactionStatus === 'capture') {
            if ($fraudStatus !== 'deny') {
                $booking->update([
                    'payment_status' => 'paid',
                    'payment_method' => $payload['payment_type'] ?? null,
                    'status' => 'confirmed',
                ]);
            }
        }
        elseif (in_array($transactionStatus, ['expire', 'cancel', 'deny'])) {
            $booking->update(['payment_status' => 'failed']);
        }

        return response('OK', 200);
    }
}
