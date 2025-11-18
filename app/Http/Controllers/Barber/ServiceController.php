<?php

namespace App\Http\Controllers\Barber;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        $barberServices = DB::table('barber_services')
            ->join('services', 'barber_services.service_id', '=', 'services.id')
            ->join('service_categories', 'services.category_id', '=', 'service_categories.id')
            ->where('barber_services.barber_id', auth()->id())
            ->select(
                'barber_services.*',
                'services.name as service_name',
                'services.description',
                'services.duration',
                'services.base_price',
                'service_categories.name as category_name'
            )
            ->get();

        $availableServices = Service::with('category')
            ->active()
            ->whereNotIn('id', function ($query) {
                $query->select('service_id')
                    ->from('barber_services')
                    ->where('barber_id', auth()->id());
            })
            ->get();

        return Inertia::render('Barber/Services/Index', [
            'barberServices' => $barberServices,
            'availableServices' => $availableServices,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'custom_duration' => 'nullable|numeric|min:0',
            'is_available' => 'boolean',
        ]);

        // Check if already exists
        $exists = DB::table('barber_services')
            ->where('barber_id', auth()->id())
            ->where('service_id', $validated['service_id'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['service_id' => 'Services already added']);
        }

        DB::table('barber_services')->insert([
            'barber_id' => auth()->id(),
            'service_id' => $validated['service_id'],
            'custom_duration' => $validated['custom_duration'] ?? null,
            'is_available' => $validated['is_available'] ?? true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Services added successfully');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'custom_duration' => 'nullable|numeric|min:0',
            'is_available' => 'boolean',
        ]);

        DB::table('barber_services')
            ->where('id', $id)
            ->where('barber_id', auth()->id())
            ->update([
                'custom_duration' => $validated['custom_duration'] ?? null,
                'is_available' => $validated['is_available'] ?? true,
                'updated_at' => now(),
            ]);

        return back()->with('success', 'Services updated successfully');
    }

    public function destroy($id)
    {
        DB::table('barber_services')
            ->where('id', $id)
            ->where('barber_id', auth()->id())
            ->delete();

        return back()->with('success', 'Services removed successfully');
    }
}
