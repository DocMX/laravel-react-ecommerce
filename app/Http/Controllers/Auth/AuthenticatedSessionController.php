<?php

namespace App\Http\Controllers\Auth;

use App\Enums\RolesEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
Use app\Services\CartService;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */

    public function create(): Response
    {
        
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request, CartService $cartService): \Symfony\Component\HttpFoundation\Response
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user()->fresh(); 
        $route = '/';
        //dd($user->getRoleNames());
        if ($user->hasAnyRole([RolesEnum::Admin,RolesEnum::Vendor])){
            $cartService->moveCartItemsToDatabase($user->id);
            return Inertia::location(route(name:'filament.admin.pages.dashboard'));
        } else {
            $route = route ('home', absolute:false);
        } 

        $cartService->moveCartItemsToDatabase($user->id);

        return redirect()->intended($route);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
