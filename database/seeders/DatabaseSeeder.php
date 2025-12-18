<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ServiceCategory;
use App\Models\Service;
use App\Models\BarberProfile;
use App\Models\BarberSchedule;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Transaction;
use App\Models\BarberTimeOff;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin
        $admin = User::create([
            'name' => 'Admin Barbershop',
            'email' => 'admin@barber.com',
            'password' => Hash::make('Admin123'),
            'email_verified_at' => now(),
            'phone' => '081234567890',
            'role' => 'admin',
            'status' => 'active',
        ]);

        // Create Services Categories
        $categories = [
            [
                'name' => 'Hair Cut',
                'description' => 'Professional hair cutting services',
                'icon' => '✂️',
            ],
            [
                'name' => 'Hair Styling',
                'description' => 'Hair styling and treatment',
                'icon' => '💇',
            ],
            [
                'name' => 'Beard Care',
                'description' => 'Beard trimming and grooming',
                'icon' => '🧔',
            ],
            [
                'name' => 'Facial Treatment',
                'description' => 'Facial care and treatment',
                'icon' => '🧖',
            ],
        ];

        foreach ($categories as $category) {
            ServiceCategory::create($category);
        }

        // Create Services
        $services = [
            // Hair Cut
            ['category_id' => 1, 'name' => 'Basic Haircut', 'duration' => 30, 'base_price' => 50000, 'description' => 'Standard haircut service'],
            ['category_id' => 1, 'name' => 'Premium Haircut', 'duration' => 45, 'base_price' => 75000, 'description' => 'Premium haircut with senior barber'],
            ['category_id' => 1, 'name' => 'Kids Haircut', 'duration' => 30, 'base_price' => 40000, 'description' => 'Haircut for children'],

            // Hair Styling
            ['category_id' => 2, 'name' => 'Hair Coloring Basic', 'duration' => 90, 'base_price' => 100000, 'description' => 'Basic basic hair coloring'],
            ['category_id' => 2, 'name' => 'Hair Coloring Advanced', 'duration' => 120, 'base_price' => 150000, 'description' => 'Professional advanced hair coloring'],
            ['category_id' => 2, 'name' => 'Hair Rebonding', 'duration' => 120, 'base_price' => 200000, 'description' => 'Hair straightening treatment'],
            ['category_id' => 2, 'name' => 'Hair Spa', 'duration' => 60, 'base_price' => 100000, 'description' => 'Relaxing hair spa treatment'],

            // Beard Care
            ['category_id' => 3, 'name' => 'Beard Trim', 'duration' => 20, 'base_price' => 35000, 'description' => 'Beard trimming and shaping'],
            ['category_id' => 3, 'name' => 'Beard Grooming Package', 'duration' => 40, 'base_price' => 60000, 'description' => 'Complete beard care package'],

            // Facial
            ['category_id' => 4, 'name' => 'Basic Facial', 'duration' => 45, 'base_price' => 80000, 'description' => 'Basic facial treatment'],
            ['category_id' => 4, 'name' => 'Premium Facial', 'duration' => 60, 'base_price' => 120000, 'description' => 'Premium facial with mask'],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }

        // Create Barbers
        $barbers = [
            [
                'name' => 'Adhetea',
                'email' => 'adhetea@barber.com',
                'phone' => '081234567891',
                'bio' => 'Expert barber with 10 years experience',
                'specialization' => 'Classic & Modern Cuts',
                'experience_years' => 10,
            ],
            [
                'name' => 'Mike Smith',
                'email' => 'mike@barber.com',
                'phone' => '081234567892',
                'bio' => 'Specialist in hair coloring and styling',
                'specialization' => 'Hair Coloring & Styling',
                'experience_years' => 7,
            ],
            [
                'name' => 'David Brown',
                'email' => 'david@barber.com',
                'phone' => '081234567893',
                'bio' => 'Beard grooming specialist',
                'specialization' => 'Beard Care Expert',
                'experience_years' => 5,
            ],
        ];

        $barberUsers = [];
        foreach ($barbers as $barberData) {
            $user = User::create([
                'name' => $barberData['name'],
                'email' => $barberData['email'],
                'password' => Hash::make('Barber123'),
                'phone' => $barberData['phone'],
                'email_verified_at' => now(),
                'role' => 'barber',
                'status' => 'active',
            ]);

            $barberProfile = BarberProfile::create([
                'user_id' => $user->id,
                'bio' => $barberData['bio'],
                'specialization' => $barberData['specialization'],
                'experience_years' => $barberData['experience_years'],
                'commission_rate' => 60,
                'is_available' => true,
            ]);

            $barberUsers[] = $user;

            // Assign services to barber
            $serviceIds = Service::inRandomOrder()->limit(5)->pluck('id');
            foreach ($serviceIds as $serviceId) {
                $user->barberServices()->attach($serviceId, [
                    'is_available' => true,
                ]);
            }

            // Create weekly schedule (Monday to Saturday)
            for ($day = 1; $day <= 6; $day++) {
                BarberSchedule::create([
                    'barber_id' => $user->id,
                    'day_of_week' => $day,
                    'start_time' => '09:00',
                    'end_time' => '18:00',
                    'is_available' => true,
                ]);
            }
        }

        // Create Sample Customers
        $customers = [
            [
                'name' => 'Nindya Zihri',
                'email' => 'nindya@cust.com',
                'phone' => '081234567894',
            ],
            [
                'name' => 'Alfian Putra',
                'email' => 'alfian@cust.com',
                'phone' => '081234567895',
            ],
            [
                'name' => 'Rizki Pratama',
                'email' => 'rizki@cust.com',
                'phone' => '081234567896',
            ],
            [
                'name' => 'Sari Dewi',
                'email' => 'sari@cust.com',
                'phone' => '081234567897',
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'budi@cust.com',
                'phone' => '081234567898',
            ],
            [
                'name' => 'Maya Sari',
                'email' => 'maya@cust.com',
                'phone' => '081234567899',
            ],
        ];

        $customerUsers = [];
        foreach ($customers as $customer) {
            $user = User::create([
                'name' => $customer['name'],
                'email' => $customer['email'],
                'email_verified_at' => now(),
                'password' => Hash::make('Customer123'),
                'phone' => $customer['phone'],
                'role' => 'customer',
                'status' => 'active',
            ]);
            $customerUsers[] = $user;
        }

        $services = Service::all();

        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now()->addDays(7);

        for ($i = 0; $i < 50; $i++) {
            $customer = $customerUsers[array_rand($customerUsers)];
            $barber = $barberUsers[array_rand($barberUsers)];
            $service = $services->random();

            $bookingDate = $this->getRandomDate($startDate, $endDate);
            $status = $this->getWeightedStatus();
            $paymentStatus = $this->getPaymentStatusBasedOnBookingStatus($status);

            $booking = Booking::create([
                'customer_id' => $customer->id,
                'barber_id' => $barber->id,
                'service_id' => $service->id,
                'booking_date' => $bookingDate->format('Y-m-d'),
                'start_time' => $this->getRandomTime(),
                'end_time' => $this->getRandomEndTime(),
                'status' => $status,
                'total_price' => $service->base_price,
                'payment_status' => $paymentStatus,
                'payment_method' => $this->getRandomPaymentMethod(),
                'notes' => $this->getRandomNotes(),
                'cancellation_reason' => $status === 'cancelled' ? $this->getRandomCancellationReason() : null,
                'cancelled_by' => $status === 'cancelled' ? $customer->id : null,
                'created_at' => $bookingDate->subDays(rand(1, 5)),
                'updated_at' => $bookingDate,
            ]);

            // Create transaction for paid bookings
            if ($paymentStatus === 'paid') {
                Transaction::create([
                    'booking_id' => $booking->id,
                    'amount' => $service->base_price,
                    'type' => 'payment',
                    'status' => 'completed',
                    'payment_gateway' => $booking->payment_method,
                    'transaction_code' => 'TRX' . str_pad($booking->id, 6, '0', STR_PAD_LEFT) . time(),
                    'metadata' => json_encode(['customer_name' => $customer->name, 'service_name' => $service->name]),
                    'created_at' => $booking->created_at,
                ]);

                // Create commission transaction for barber
                $commissionRate = $barber->barberProfile->commission_rate ?? 60;
                $commissionAmount = ($service->base_price * $commissionRate) / 100;

                Transaction::create([
                    'booking_id' => $booking->id,
                    'amount' => $commissionAmount,
                    'type' => 'commission',
                    'status' => 'completed',
                    'payment_gateway' => 'system',
                    'transaction_code' => 'COM' . str_pad($booking->id, 6, '0', STR_PAD_LEFT) . time(),
                    'metadata' => json_encode(['barber_name' => $barber->name, 'commission_rate' => $commissionRate]),
                    'created_at' => $booking->created_at->addHours(2),
                ]);
            }

            // Create review for completed bookings
            if ($status === 'completed' && rand(0, 1)) {
                Review::create([
                    'booking_id' => $booking->id,
                    'customer_id' => $customer->id,
                    'barber_id' => $barber->id,
                    'rating' => rand(4, 5),
                    'comment' => $this->getRandomReviewComment(),
                    'created_at' => $booking->created_at->addHours(3),
                ]);

                // Update barber rating
                $this->updateBarberRating($barber);
            }
        }

        // Create barber time off
        foreach ($barberUsers as $barber) {
            if (rand(0, 1)) {
                $timeOffStart = Carbon::now()->addDays(rand(5, 15));
                BarberTimeOff::create([
                    'barber_id' => $barber->id,
                    'start_date' => $timeOffStart->format('Y-m-d 00:00:00'),
                    'end_date' => $timeOffStart->addDays(rand(1, 3))->format('Y-m-d 23:59:59'),
                    'reason' => $this->getRandomTimeOffReason(),
                    'created_at' => now(),
                ]);
            }
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin: admin@barber.com / Admin123');
        $this->command->info('Barbers: adhetea@barber.com, mike@barber.com, david@barber.com / Barber123');
        $this->command->info('Customers: nindya@cust.com, alfian@cust.com, etc / Customer123');
        $this->command->info('Created 50 bookings with transactions and reviews!');
    }

    private function getRandomDate(Carbon $start, Carbon $end): Carbon
    {
        return Carbon::createFromTimestamp(rand($start->timestamp, $end->timestamp));
    }

    private function getRandomTime(): string
    {
        $hours = [9, 10, 11, 13, 14, 15, 16, 17];
        $hour = $hours[array_rand($hours)];
        $minute = rand(0, 1) ? '00' : '30';

        return sprintf('%02d:%s', $hour, $minute);
    }

    private function getRandomEndTime(): string
    {
        $hours = [10, 11, 12, 14, 15, 16, 17, 18];
        $hour = $hours[array_rand($hours)];
        $minute = rand(0, 1) ? '00' : '30';

        return sprintf('%02d:%s', $hour, $minute);
    }

    private function getWeightedStatus(): string
    {
        $statuses = [
            'completed' => 40,
            'confirmed' => 25,
            'pending' => 15,
            'in_progress' => 10,
            'cancelled' => 10,
        ];

        $total = array_sum($statuses);
        $random = rand(1, $total);
        $current = 0;

        foreach ($statuses as $status => $weight) {
            $current += $weight;
            if ($random <= $current) {
                return $status;
            }
        }

        return 'completed';
    }

    private function getPaymentStatusBasedOnBookingStatus(string $bookingStatus): string
    {
        return match($bookingStatus) {
            'cancelled' => rand(0, 1) ? 'refunded' : 'unpaid',
            'completed', 'in_progress', 'confirmed' => 'paid',
            default => 'unpaid',
        };
    }

    private function getRandomPaymentMethod(): string
    {
        $methods = ['credit_card', 'debit_card', 'bank_transfer', 'e_wallet', 'cash'];
        return $methods[array_rand($methods)];
    }

    private function getRandomNotes(): ?string
    {
        $notes = [
            'Please be gentle with my hair',
            'I have sensitive skin',
            'Need quick service',
            'Special occasion',
            'First time here',
            'Regular customer',
            null,
            null,
            null,
        ];

        return $notes[array_rand($notes)];
    }

    private function getRandomCancellationReason(): string
    {
        $reasons = [
            'Change of plans',
            'Emergency came up',
            'Found another barber',
            'Not feeling well',
            'Schedule conflict',
            'Double booked',
        ];

        return $reasons[array_rand($reasons)];
    }

    private function getRandomReviewComment(): string
    {
        $comments = [
            'Great service! Very professional.',
            'Love the haircut, will come back again.',
            'Friendly barber, excellent skills.',
            'Clean place and good atmosphere.',
            'Took time to understand what I wanted.',
            'Best barber in town!',
            'Very satisfied with the service.',
            'Reasonable price for great quality.',
        ];

        return $comments[array_rand($comments)];
    }

    private function getRandomTimeOffReason(): string
    {
        $reasons = [
            'Family vacation',
            'Personal matters',
            'Health checkup',
            'Training and development',
            'Holiday break',
            'Emergency leave',
        ];

        return $reasons[array_rand($reasons)];
    }

    private function updateBarberRating(User $barber): void
    {
        $reviews = Review::where('barber_id', $barber->id)->get();

        if ($reviews->count() > 0) {
            $averageRating = $reviews->avg('rating');
            $barber->barberProfile->update([
                'rating_average' => round($averageRating, 1),
                'total_reviews' => $reviews->count(),
            ]);
        }
    }
}
