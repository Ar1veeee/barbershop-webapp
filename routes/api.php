<?php

use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

Route::post('/midtrans/notification', [PaymentController::class, 'notificationHandler']);
