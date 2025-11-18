<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\Booking;
use App\Models\User;
use App\Models\Service;
use App\Policies\BookingPolicy;
use App\Policies\UserPolicy;
use App\Policies\ServicePolicy;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Booking::class => BookingPolicy::class,
        User::class => UserPolicy::class,
        Service::class => ServicePolicy::class,
    ];

    public function boot(): void
    {
        Gate::policy(Booking::class, BookingPolicy::class);
    }
}
