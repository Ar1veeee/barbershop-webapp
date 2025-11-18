<?php

namespace App\Policies;

use App\Models\User;

class ServicePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, \App\Models\Service $service): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, \App\Models\Service $service): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, \App\Models\Service $service): bool
    {
        return $user->isAdmin();
    }
}
