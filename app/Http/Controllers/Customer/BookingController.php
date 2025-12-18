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
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    use AuthorizesRequests;

    private function authorizeBooking(Booking $booking, string $ability = 'view'): void
    {
        $this->authorize($ability, $booking);
    }

    public function __construct(
        protected BookingService $bookingService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        $statusCounts = Booking::where('customer_id', $user->id)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $totalAll = Booking::where('customer_id', $user->id)->count();

        $counts = [
            'all' => $totalAll,
            'pending' => $statusCounts['pending'] ?? 0,
            'confirmed' => $statusCounts['confirmed'] ?? 0,
            'in_progress' => $statusCounts['in_progress'] ?? 0,
            'completed' => $statusCounts['completed'] ?? 0,
            'cancelled' => $statusCounts['cancelled'] ?? 0,
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
        $barbers = User::availableBarbersWithServices()->get();

        $services = Service::with('category')->active()->get();

        return Inertia::render('Customer/Bookings/Create', [
            'barbers' => $barbers,
            'services' => $services,
            'selected_barber_id' => $request->query('barber_id') ? (int)$request->query('barber_id') : null,
        ]);
    }

    public function store(StoreBookingRequest $request)
    {
        $booking = $this->bookingService->createBooking($request->validated(), $request->user());

        return redirect()->route('customer.bookings.payment', $booking)
            ->with('success', 'Booking reserved! Complete payment within 30 minutes to confirm your slot.');
    }

    public function payment(Request $request, Booking $booking)
    {
        $this->authorizeBooking($booking);

        $snapToken = $this->bookingService->generateSnapToken($booking, $request->user());

        return Inertia::render('Customer/Bookings/Payment', [
            'booking' => $booking->load(['barber.barberProfile', 'service']),
            'snapToken' => $snapToken,
        ]);
    }

    public function show(Booking $booking)
    {
        $this->authorizeBooking($booking);

        $booking->load(['barber.barberProfile', 'service.category', 'review', 'discount']);

        return Inertia::render('Customer/Bookings/Show', ['booking' => $booking]);
    }

    public function cancel(Request $request, Booking $booking)
    {
        $this->authorizeBooking($booking, 'cancel');

        $booking->cancelBy($request->user(), $request->input('reason'));

        return redirect()->route('customer.bookings.index')
            ->with('success', 'Booking cancelled successfully');
    }
}
