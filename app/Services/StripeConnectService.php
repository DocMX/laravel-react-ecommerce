<?php

namespace App\Services;

use Stripe\StripeClient;
use Stripe\Exception\ApiErrorException;
use App\Models\User;

class StripeConnectService
{
    protected $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * Crea una cuenta Stripe Connect Express
     */
    public function createExpressAccount(User $user, string $type = 'express')
    {
        try {
            $account = $this->stripe->accounts->create([
                'type' => $type,
                'country' => 'US', // Cambia según tu necesidad
                'email' => $user->email,
                'capabilities' => [
                    'card_payments' => ['requested' => true],
                    'transfers' => ['requested' => true],
                ],
                'business_type' => 'individual',
                'individual' => [
                    'email' => $user->email,
                    'first_name' => $user->first_name ?? '',
                    'last_name' => $user->last_name ?? '',
                ],
            ]);

            return $account;
        } catch (ApiErrorException $e) {
            throw new \Exception("Error creating Stripe account: ".$e->getMessage());
        }
    }

    /**
     * Genera un enlace de onboarding para la cuenta
     */
    public function createAccountLink(string $accountId, string $refreshUrl, string $returnUrl)
    {
        try {
            return $this->stripe->accountLinks->create([
                'account' => $accountId,
                'refresh_url' => $refreshUrl,
                'return_url' => $returnUrl,
                'type' => 'account_onboarding',
            ]);
        } catch (ApiErrorException $e) {
            throw new \Exception("Error creating account link: ".$e->getMessage());
        }
    }

    /**
     * Recupera los detalles de una cuenta Stripe
     */
    public function getAccount(string $accountId)
    {
        try {
            return $this->stripe->accounts->retrieve($accountId);
        } catch (ApiErrorException $e) {
            throw new \Exception("Error retrieving account: ".$e->getMessage());
        }
    }

    /**
     * Crea una transferencia a una cuenta conectada
     */
    public function createTransfer(string $destinationAccountId, int $amount, string $currency, ?string $description = null)
    {
        try {
            $params = [
                'amount' => $amount,
                'currency' => $currency,
                'destination' => $destinationAccountId,
            ];

            if ($description) {
                $params['description'] = $description;
            }

            return $this->stripe->transfers->create($params);
        } catch (ApiErrorException $e) {
            throw new \Exception("Error creating transfer: ".$e->getMessage());
        }
    }

    /**
     * Crea un cargo con destino a una cuenta conectada
     */
    public function createDestinationCharge(int $amount, string $currency, string $destinationAccountId, array $params = [])
    {
        try {
            $defaultParams = [
                'amount' => $amount,
                'currency' => $currency,
                'destination' => [
                    'account' => $destinationAccountId,
                ],
            ];

            $finalParams = array_merge($defaultParams, $params);

            return $this->stripe->charges->create($finalParams);
        } catch (ApiErrorException $e) {
            throw new \Exception("Error creating destination charge: ".$e->getMessage());
        }
    }
}