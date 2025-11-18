<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::with('category');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->status && $request->status !== 'all') {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        $services = $query->orderBy('category_id')
            ->orderBy('name')
            ->paginate(15);

        $categories = ServiceCategory::all();

        return Inertia::render('Admin/Services/Index', [
            'services' => $services,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:service_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        Service::create($validated);

        return back()->with('success', 'Services created successfully');
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:service_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $service->update($validated);

        return back()->with('success', 'Services updated successfully');
    }

    public function destroy(Service $service)
    {
        $hasBookings = Booking::where('service_id', $service->id)->exists();

        if ($hasBookings) {
            return back()->withErrors(['error' => 'Cannot delete service with existing bookings. Deactivate instead.']);
        }

        $service->delete();

        return back()->with('success', 'Services deleted successfully');
    }
}
