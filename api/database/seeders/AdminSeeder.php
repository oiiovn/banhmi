<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo admin mặc định
        User::firstOrCreate(
            ['email' => 'admin@banhmi.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        // Tạo đại lý mẫu
        User::firstOrCreate(
            ['email' => 'agent1@banhmi.com'],
            [
                'name' => 'Đại lý 1',
                'password' => Hash::make('agent123'),
                'phone' => '0901234567',
                'address' => '123 Đường ABC, Quận 1, TP.HCM',
                'role' => 'agent',
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'agent2@banhmi.com'],
            [
                'name' => 'Đại lý 2',
                'password' => Hash::make('agent123'),
                'phone' => '0907654321',
                'address' => '456 Đường XYZ, Quận 2, TP.HCM',
                'role' => 'agent',
                'is_active' => true,
            ]
        );
    }
}




