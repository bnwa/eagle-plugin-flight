// API communication module
// This will handle REST API communication with mock support

export interface ApiResponse<T = any> {
    data: T;
    status: number;
    message?: string;
}

export class ApiClient {
    private baseUrl: string;
    private mockMode: boolean;

    constructor(baseUrl: string = '/api', mockMode: boolean = false) {
        this.baseUrl = baseUrl;
        this.mockMode = mockMode;
    }

    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        if (this.mockMode) {
            return this.mockRequest<T>('GET', endpoint);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`);
        const data = await response.json();
        
        return {
            data,
            status: response.status,
            message: response.statusText
        };
    }

    async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
        if (this.mockMode) {
            return this.mockRequest<T>('POST', endpoint, body);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        return {
            data,
            status: response.status,
            message: response.statusText
        };
    }

    private async mockRequest<T>(method: string, endpoint: string, body?: any): Promise<ApiResponse<T>> {
        console.log(`Mock ${method} request to ${endpoint}`, body);
        
        // Mock data based on endpoint
        const mockData = this.getMockData(endpoint);
        
        return {
            data: mockData as T,
            status: 200,
            message: 'OK (Mock)'
        };
    }

    private getMockData(endpoint: string): any {
        // Return mock data based on endpoint
        switch (endpoint) {
            case '/status':
                return { status: 'healthy', timestamp: Date.now() };
            case '/data':
                return { items: [], total: 0 };
            default:
                return { message: 'Mock response' };
        }
    }
}

export const apiClient = new ApiClient();
