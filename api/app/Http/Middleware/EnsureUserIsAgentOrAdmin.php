<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAgentOrAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (! $user || (! $user->isAgent() && ! $user->isAdmin())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Agent or Admin access required.',
            ], 403);
        }

        return $next($request);
    }
}




