import { demoService } from './demoService';

const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * apiFetch
 * A wrapper around the window.fetch API that checks if the user is in 
 * local "Demo Mode" and redirects calls to the browser's localStorage.
 */
export const apiFetch = async (endpoint, options = {}, authContext = {}) => {
    const { isDemo, token } = authContext;

    // --- Branch to Demo Service if in Demo Mode ---
    if (isDemo) {
        return handleDemoRequest(endpoint, options);
    }

    // --- Normal Backend Request ---
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API Request Failed');
    }

    return response.json();
};

/**
 * handleDemoRequest
 * Intercepts internal API calls and routes them to the local Demo Service
 */
const handleDemoRequest = async (endpoint, options) => {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Endpoint Mapping
    if (endpoint.includes('/api/expenses/summary')) {
        return demoService.getSummary();
    }
    
    if (endpoint.includes('/api/expenses/insights')) {
        return { insights: ["Great job! Your spending is well within your demo budget.", "You spent 15% less on Food this week compared to last."] };
    }

    if (endpoint.includes('/api/expenses')) {
        if (method === 'GET') return demoService.getExpenses();
        if (method === 'POST') return demoService.addExpense(body);
        
        const id = endpoint.split('/').pop();
        if (method === 'PUT') return demoService.updateExpense(id, body);
        if (method === 'DELETE') return demoService.deleteExpense(id);
    }

    if (endpoint.includes('/api/budget')) {
        if (method === 'GET') return demoService.getBudget();
        if (method === 'POST') return demoService.setBudget(body.monthlyLimit);
    }

    if (endpoint.includes('/api/ai/advisor')) {
        // AI queries in demo mode still hit the real backend for the response,
        // but we manage the quota check separately.
        // Actually, if we want to hit the backend, we need the "token" or a public endpoint.
        // For simplicity in this demo, we'll hit the real API but ensure the caller 
        // handles the local count.
        return null; // Special case handled in the page component
    }

    throw new Error(`Endpoint ${endpoint} not implemented in Demo Mode`);
};
