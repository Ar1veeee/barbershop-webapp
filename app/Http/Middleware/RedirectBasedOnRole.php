<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectBasedOnRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            switch ($user->role) {
                case 'customer':
                    return redirect()->route('customer.dashboard');
                case 'barber':
                    return redirect()->route('barber.dashboard');
                case 'admin':
                    return redirect()->route('admin.dashboard');
                default:
                    return $next($request);
            }
        } else {
            return $next($request);
        }
    }
}
