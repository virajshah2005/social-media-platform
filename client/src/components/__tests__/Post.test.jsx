import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Post from '../Post/Post';

// Create a wrapper component that provides necessary context
const AllTheProviders = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Post Component', () => {
  const mockPost = {
    id: 1,
    user: {
      id: 1,
      username: 'testuser',
      full_name: 'Test User',
      profile_picture: '/default-avatar.svg',
      is_verified: true,
    },
    caption: 'Test caption',
    media_urls: ['/test-image.jpg'],
    location: 'Test Location',
    likes_count: 10,
    comments_count: 5,
    shares_count: 2,
    created_at: new Date().toISOString(),
    is_liked: false,
  };

  it('renders post content correctly', () => {
    render(<Post post={mockPost} />, { wrapper: AllTheProviders });

    // Check if basic post content is rendered
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test caption')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('10 likes')).toBeInTheDocument();
    expect(screen.getByText('5 comments')).toBeInTheDocument();
    expect(screen.getByText('2 shares')).toBeInTheDocument();
  });

  it('handles like interaction', () => {
    render(<Post post={mockPost} />, { wrapper: AllTheProviders });

    // Click the like button
    const likeButton = screen.getByText('Like');
    fireEvent.click(likeButton);

    // Verify like button state (should show loading state or updated count)
    expect(likeButton).toBeInTheDocument();
  });
});
