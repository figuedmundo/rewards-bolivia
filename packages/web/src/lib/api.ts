import axios, { AxiosInstance } from 'axios';

class ApiService {
  private static instance: ApiService;
  public api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: '/api',
      withCredentials: true, // Send cookies with requests
    });

    // Add a response interceptor for handling token refreshes
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Check for 401 Unauthorized and ensure it's not a retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Use a fresh axios instance for the refresh call to avoid interceptor loops
            await axios.post(
              `${this.api.defaults.baseURL}/auth/refresh`,
              {},
              {
                withCredentials: true,
              },
            );

            // The refresh endpoint should set the new access token cookie automatically.
            // We can now retry the original request.
            return this.api(originalRequest);
          } catch (refreshError) {
            console.error('Unable to refresh token', refreshError);
            // Only redirect to login if this wasn't a refresh request itself
            // This prevents infinite loops when the app initializes and refresh fails
            if (!originalRequest.url?.includes('/auth/refresh')) {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Example of how to add specific methods
  // async login(credentials: YourLoginDto) {
  //   const response = await this.api.post('/auth/login', credentials);
  //   return response.data;
  // }
}

const api = ApiService.getInstance().api;

export default api;