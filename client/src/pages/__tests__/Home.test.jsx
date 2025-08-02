import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Home from '../../pages/Home/Home';

const mockPosts = [
  {
    id: 1,
    user: {
      id: 1,
      username: 'testuser',
      full_name: 'Test User',
      profile_picture: '/default-avatar.svg',
    },
    caption: 'Test post 1',
    media_urls: [],
    likes_count: 0,
    comments_count: 0,
    created_at: new Date().toISOString(),
  },
];

// Mock the API calls
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.resetAllMocks();
  const mockAxios = require('axios');
  mockAxios.create.mockImplementation(() => ({
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  }));
});

const AllTheProviders = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 0,
        cacheTime: 0,
        refetchInterval: false,
        refetchIntervalInBackground: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            {children}
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Home Page', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    // Get a new QueryClient instance
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Create a mock API instance with a never-resolving promise
    const mockAxios = require('axios');
    const mockGet = jest.fn(() => new Promise(() => {}));
    const mockApiInstance = {
      get: mockGet,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };
    mockAxios.create.mockReturnValue(mockApiInstance);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <BrowserRouter>
              <Home />
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
    
    expect(screen.getByTestId('loading-spinner-md')).toBeInTheDocument();
  });

  it('renders posts after successful API call', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
          staleTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
      logger: {
        log: console.log,
        warn: console.warn,
        error: () => {},
      },
    });

    // Set up mock responses
    const mockAxios = require('axios');
    let apiCalls = [];
    const mockGet = jest.fn((url) => {
      apiCalls.push(url);
      switch (url) {
        case '/api/posts':
          return Promise.resolve({
            data: { posts: mockPosts },
            status: 200,
          });
        case '/api/stories':
          return Promise.resolve({
            data: { stories: [] },
            status: 200,
          });
        default:
          return Promise.reject(new Error(`Unhandled GET request to ${url}`));
      }
    });

    const mockApiInstance = {
      get: mockGet,
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    };

    mockAxios.create.mockReturnValue(mockApiInstance);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <Home />
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    );

    // First verify loading state
    const loadingSpinner = screen.getByTestId('loading-spinner-md');
    expect(loadingSpinner).toBeInTheDocument();

    // Then wait for content to appear (this implicitly means loading is done)
    await screen.findByText('Test post 1');

    // And verify both API calls were made
    expect(apiCalls).toContain('/api/posts');
    expect(apiCalls).toContain('/api/stories');

    // And spinner should be gone
    expect(screen.queryByTestId('loading-spinner-md')).not.toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    // Get a new QueryClient instance
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    // Set up axios mock to reject
    const mockAxios = require('axios');
    const mockGet = jest.fn().mockRejectedValue(new Error('Failed to fetch'));
    mockAxios.create.mockReturnValue({
      get: mockGet,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <BrowserRouter>
              <Home />
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load posts\. Please try again\./i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
          staleTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
      logger: {
        log: console.log,
        warn: console.warn,
        error: () => {},
      },
    });

    // Set up mock responses
    const mockAxios = require('axios');
    const mockGet = jest.fn().mockRejectedValue(new Error('API Error'));
    const mockApiInstance = {
      get: mockGet,
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    };

    mockAxios.create.mockReturnValue(mockApiInstance);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <Home />
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    );

    // First verify loading state
    expect(screen.getByTestId('loading-spinner-md')).toBeInTheDocument();

    // Then wait for error state
    await screen.findByText(/something went wrong/i);

    // Loading spinner should be gone
    expect(screen.queryByTestId('loading-spinner-md')).not.toBeInTheDocument();
  });
});
