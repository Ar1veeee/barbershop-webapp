<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = ServiceCategory::withCount('services')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:service_categories,name',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:10',
        ]);

        ServiceCategory::create($validated);

        return back()->with('success', 'Category created successfully');
    }

    public function update(Request $request, ServiceCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:service_categories,name,' . $category->id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:10',
        ]);

        $category->update($validated);

        return back()->with('success', 'Category updated successfully');
    }

    public function destroy(ServiceCategory $category)
    {
        if ($category->services()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete category with existing services']);
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully');
    }
}
