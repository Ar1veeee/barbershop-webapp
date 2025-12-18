<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreBookingRequest;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use App\Services\Customer\BookingService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected BookingService $bookingService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        $baseQuery = Booking::where('customer_id', $user->id);

        $counts = [
            'all' => (clone $baseQuery)->count(),
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
            'confirmed' => (clone $baseQuery)->where('status', 'confirmed')->count(),
            'in_progress' => (clone $baseQuery)->where('status', 'in_progress')->count(),
            'completed' => (clone $baseQuery)->where('status', 'completed')->count(),
            'cancelled' => (clone $baseQuery)->where('status', 'cancelled')->count(),
        ];

        $query = Booking::with(['barber.barberProfile', 'service'])
            ->where('customer_id', $user->id);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $bookings = $query->latest('booking_date')->orderBy('start_time', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('Customer/Bookings/Index', [
            'bookings' => $bookings,
            'filters' => $request->only('status'),
            'counts' => $counts,
        ]);
    }

    public function create(Request $request)
    {
        $barbers = User::with(['barberProfile.services' => fn($q) => $q->withPivot('custom_price', 'is_available')])
            ->barbers()->active()
            ->whereHas('barberProfile', fn($q) => $q->where('is_available', true))
            ->get();

        $services = Service::with('category')->active()->get();

        return Inertia::render('Customer/Bookings/Create', [
            'barbers' => $barbers,
            'services' => $services,
            'selected_barber_id' => $request->query('barber_id') ? (int)$request->query('barber_id') : null,
        ]);
    }

    public function store(StoreBookingRequest $request)
    {
        try {
            $booking = $this->bookingService->createBooking($request->validated(), $request->user());

            return redirect()->route('customer.bookings.pay', $booking)
                ->with('success', 'Booking reserved! Complete payment within 30 minutes to confirm your slot.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function pay(Request $request, Booking $booking)
    {
        $this->authorize('view', $booking);

        try {
            $snapToken = $this->bookingService->generateSnapToken($booking, $request->user());
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        return Inertia::render('Customer/Bookings/Payment', [
            'booking' => $booking->load(['barber.barberProfile', 'service']),
            'snapToken' => $snapToken,
        ]);
    }

    public function show(Booking $booking)
    {
        $this->authorize('view', $booking);

        $booking->load(['barber.barberProfile', 'service.category', 'review', 'discount']);

        return Inertia::render('Customer/Bookings/Show', ['booking' => $booking]);
    }

    public function cancel(Request $request, Booking $booking)
    {
        $this->authorize('cancel', $booking);

        if (!$booking->canBeCancelled()) {
            return back()->withErrors(['error' => 'This booking cannot be cancelled']);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancelled_by' => $request->user()->id,
            'cancellation_reason' => $request->input('reason'),
        ]);

        return redirect()->route('customer.bookings.index')
            ->with('success', 'Booking cancelled successfully');
    }
}
