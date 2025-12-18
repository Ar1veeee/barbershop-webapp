<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Customer Controllers
use App\Http\Controllers\Customer\DashboardController as CustomerDashboard;
use App\Http\Controllers\Customer\DiscountController as CustomerDiscount;
use App\Http\Controllers\Customer\BookingController as CustomerBooking;
use App\Http\Controllers\Customer\BarberController as CustomerBarber;
use App\Http\Controllers\Customer\ReviewController as CustomerReview;

// Barber Controllers
use App\Http\Controllers\Barber\DashboardController as BarberDashboard;
use App\Http\Controllers\Barber\BookingController as BarberBooking;
use App\Http\Controllers\Barber\ServiceController as BarberService;
use App\Http\Controllers\Barber\ProfileController as BarberProfile;
use App\Http\Controllers\Barber\EarningController as BarberEarning;

// Admin Controllers
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\UserController as AdminUser;
use App\Http\Controllers\Admin\BarberController as AdminBarber;
use App\Http\Controllers\Admin\ScheduleController as AdminBarberSchedule;
use App\Http\Controllers\Admin\ServiceController as AdminService;
use App\Http\Controllers\Admin\CategoryController as AdminCategory;
use App\Http\Controllers\Admin\DiscountController as AdminDiscount;
use App\Http\Controllers\Admin\BookingController as AdminBooking;
use App\Http\Controllers\Admin\ReportController as AdminReport;
use Illuminate\Http\Request;

// ============================================
// PUBLIC ROUTES
// ============================================
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home')->middleware('redirect.role');

// Redirect after login based on role
Route::get('/dashboard', function (Request $request) {
    $user = $request->user();

    return redirect()->route($user->role . ".dashboard");
})->middleware(['auth', 'verified'])->name('dashboard');

// ============================================
// CUSTOMER ROUTES
// ============================================
Route::middleware(['auth', 'verified', 'customer'])->prefix('customer')->name('customer.')->group(function () {
    // Dashboard`
    Route::get('/dashboard', [CustomerDashboard::class, 'index'])->name('dashboard');

    // Discounts
    Route::controller(CustomerDiscount::class)->prefix('discounts')->name('discounts.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/recommendation', 'recommendations')->name('recommendations');
        Route::get('/usage-history', 'usageHistory')->name('usage-history');
        Route::get('/{discount}', 'show')->name('show');
        Route::post('/validate', 'validateDiscount')->name('validate');
    });

    // Bookings
    Route::controller(CustomerBooking::class)->prefix('bookings')->name('bookings.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('/{booking}', 'show')->name('show');
        Route::get('/{booking}/payment', 'payment')->name('payment');
        Route::post('/{booking}/cancel', 'cancel')->name('cancel');
    });

    // Reviews
    Route::post('/bookings/{booking}/review', [CustomerReview::class, 'store'])->name('reviews.store');

    // Barbers
    Route::controller(CustomerBarber::class)->prefix('barbers')->name('barbers.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{user}', 'show')->name('show');
        Route::get('/{user}/available-slots', 'availableSlots')->name('slots');
    });

    // Profiles
    Route::controller(ProfileController::class)->prefix('profile')->group(function () {
        Route::get('/', 'edit')->name('profile.edit');
        Route::patch('/', 'update')->name('profile.update');
        Route::delete('/', 'destroy')->name('profile.destroy');
    });
});

// ============================================
// BARBER ROUTES
// ============================================
Route::middleware(['auth', 'verified', 'barber'])->prefix('barber')->name('barber.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [BarberDashboard::class, 'index'])->name('dashboard');

    // Bookings
    Route::controller(BarberBooking::class)->prefix('bookings')->name('bookings.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/calendar', 'calendar')->name('calendar');
        Route::get('/{booking}', 'show')->name('show');
    });

    // Services
    Route::controller(BarberService::class)->prefix('services')->name('services.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{id}', 'update')->name('update');
        Route::delete('/{id}', 'destroy')->name('destroy');
    });

    // Earnings
    Route::get('/earnings', [BarberEarning::class, 'index'])->name('earnings.index');

    // Profiles
    Route::controller(BarberProfile::class)->prefix('profiles')->name('profiles.')->group(function () {
        Route::get('/', 'edit')->name('edit');
        Route::patch('/', 'update')->name('update');
        Route::patch('/availability', 'updateAvailability')->name('availability');
    });
});

// ============================================
// ADMIN ROUTES
// ============================================
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');

    // User Management
    Route::controller(AdminUser::class)->prefix('users')->name('users.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{user}', 'show')->name('show');
        Route::post('/', 'store')->name('store');
        Route::put('/{user}', 'update')->name('update');
        Route::delete('/{user}', 'destroy')->name('destroy');
        Route::post('/{user}/reset-password', 'resetPassword')->name('reset-password');
    });

    // Barber Management
    Route::controller(AdminBarber::class)->prefix('barbers')->name('barbers.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/{user}/commission', 'updateCommission')->name('commission');
    });

    // Schedules Management
    Route::controller(AdminBarberSchedule::class)->prefix('schedules')->name('schedules.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'updateSchedule')->name('update');
        Route::post('/time-off', 'storeTimeOff')->name('timeoff.store');
        Route::delete('/time-off/{timeOff}', 'deleteTimeOff')->name('timeoff.destroy');
    });

    // Services Management
    Route::controller(AdminService::class)->prefix('services')->name('services.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{service}', 'update')->name('update');
        Route::delete('/{service}', 'destroy')->name('destroy');
    });

    // Category Management
    Route::controller(AdminCategory::class)->prefix('categories')->name('categories.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{category}', 'update')->name('update');
        Route::delete('/{category}', 'destroy')->name('destroy');
    });

    // Discounts Management
    Route::controller(AdminDiscount::class)->prefix('discounts')->name('discounts.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('/usage-history', 'usageHistory')->name('usage-history');
        Route::get('/{discount}/usage-history', 'usageHistory')->name('discount-usage-history');
        Route::get('/{discount}', 'show')->name('show');
        Route::get('/{discount}/edit', 'edit')->name('edit');
        Route::put('/{discount}', 'update')->name('update');
        Route::delete('/{discount}', 'destroy')->name('destroy');
        Route::post('/{discount}/toggle-status', 'toggleStatus')->name('toggle-status');
        Route::post('/{discount}/assign-customer', 'assignToCustomer')->name('assign-customer');
        Route::delete('/{discount}/remove-customer/{customerId}', 'removeFromCustomer')->name('remove-customer');
    });

    // Bookings Management
    Route::controller(AdminBooking::class)->prefix('bookings')->name('bookings.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{booking}', 'show')->name('show');
        Route::patch('/{booking}', 'update')->name('update');
    });

    // Reports
    Route::get('/reports', [AdminReport::class, 'index'])->name('reports.index');
});

Route::get('/profile', [ProfileController::class, 'edit'])
    ->name('profile.fallback')
    ->middleware(['auth']);

// Auth Routes (provided by Breeze)
require __DIR__ . '/auth.php';
