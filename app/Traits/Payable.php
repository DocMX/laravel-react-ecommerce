<?php

namespace App\Traits;

use App\Services\StripeConnectService;
use Exception;
use Illuminate\Support\Facades\URL;

trait Payable
{
    /**
     * Crea una cuenta Stripe Connect
     */
    public function createStripeAccount(array $params = ['type' => 'express'])
    {
        $stripeService = app(StripeConnectService::class);

        $account = $stripeService->createExpressAccount($this, $params['type']);

        $this->stripe_account_id = $account->id;
        $this->stripe_account_active = false;
        $this->save();

        return $this;
    }

    /**
     * Obtiene el enlace de onboarding
     */
    public function getStripeAccountLink($refreshUrl = null, $returnUrl = null)
    {
        if (!$this->stripe_account_id) {
            throw new Exception("No Stripe account ID found");
        }

        $stripeService = app(StripeConnectService::class);

        $refreshUrl = $refreshUrl ?: URL::route('stripe.refresh');
        $returnUrl = $returnUrl ?: URL::route('stripe.return');

        return $stripeService->createAccountLink(
            $this->stripe_account_id,
            $refreshUrl,
            $returnUrl
        )->url;
    }

    /**
     * Verifica si la cuenta está activa
     */
    public function isStripeAccountActive()
    {
        if (!$this->stripe_account_id) {
            return false;
        }

        if ($this->stripe_account_active) {
            return true;
        }

        // Verificar con Stripe si es necesario
        $stripeService = app(StripeConnectService::class);
        $account = $stripeService->getAccount($this->stripe_account_id);

        if ($account->details_submitted && $account->charges_enabled) {
            $this->stripe_account_active = true;
            $this->stripe_account_data = json_encode($account);
            $this->save();
            return true;
        }

        return false;
    }

    /**
     * Realiza una transferencia
     */
    public function transfer($amount, $currency, $description = null)
    {
        if (!$this->isStripeAccountActive()) {
            throw new Exception("Stripe account not active");
        }

        $stripeService = app(StripeConnectService::class);

        return $stripeService->createTransfer(
            $this->stripe_account_id,
            $amount,
            $currency,
            $description
        );
    }

    /**
     * Obtiene el ID de la cuenta Stripe
     */
    public function getStripeAccountId()
    {
        return $this->stripe_account_id;
    }
}