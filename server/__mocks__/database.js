const mockPool = {
  execute: jest.fn(),
  end: jest.fn(),
};

const mockResults = {
  user: {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    full_name: 'Test User',
    created_at: new Date().toISOString(),
  },
};

// Mock successful registration
mockPool.execute.mockImplementation((query, params) => {
  if (query.includes('INSERT INTO users')) {
    return [{ insertId: 1 }];
  }
  if (query.includes('SELECT * FROM users WHERE email')) {
    return [[]]; // No existing user for registration
  }
  if (query.includes('SELECT * FROM users WHERE id')) {
    return [[mockResults.user]];
  }
  return [[]];
});

module.exports = {
  pool: mockPool,
  mockResults,
};
