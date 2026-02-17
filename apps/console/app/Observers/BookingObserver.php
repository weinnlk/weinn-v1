<?php

namespace App\Observers;

use App\Models\Booking;

class BookingObserver
{
    /**
     * Handle the Booking "saving" event.
     */
    public function saving(Booking $booking): void
    {
        // Only calculate commission if the booking is confirmed
        if (strtolower($booking->status) === 'confirmed') {
            
            // Ensure commission rate is set, default to 2.2%
            if ($booking->commission_rate === null) {
                $booking->commission_rate = 0.022;
            }

            // Calculate commission amount if total_amount_lkr is present
            if ($booking->total_amount_lkr !== null) {
                // Calculation: Total * (2.2 / 100)
                $booking->commission_amount_lkr = $booking->total_amount_lkr * ($booking->commission_rate / 100);
            }
        }
    }
}
