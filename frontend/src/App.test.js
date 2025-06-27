import { render, screen } from '@testing-library/react';

// Mock react-router-dom to avoid ESM resolution issues in Jest while still
// providing the minimal API that App.js expects.
jest.mock('react-router-dom', () => {
  const React = require('react');
  return {
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <div>{children}</div>,
    Route: ({ element }) => <div>{element}</div>,
    Navigate: ({ children }) => <div>{children}</div>,
    Link: ({ children }) => <span>{children}</span>,
    useNavigate: () => jest.fn(),
  };
}, { virtual: true });

const App = require('./App').default;

// When no user is authenticated, the App should render the Login page after the
// initial loading state. We assert that the Login heading appears in the DOM.
test('renders login page when user is unauthenticated', async () => {
  render(<App />);

  // Wait for the heading "Login" to appear once AuthProvider finishes loading
  const loginHeading = await screen.findByRole('heading', { name: /login/i });
  expect(loginHeading).toBeInTheDocument();
});
