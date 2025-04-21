<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StripeController extends Controller
{
    public function success()
    {

    }

    public function failure()
    {

    }

    public function webhook(Request $request)
    {
        $stripe = new \Stripe\StripeClient(config('app.stripe_secret_key'));

        $endpoint_secret = config('app.stripe_endpoint_secret');

        $payload = $request->getContent();
        $sig_header = request()->header('Stripe_Signature');
        $event = null;
    }
}
