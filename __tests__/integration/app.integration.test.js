import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mocked components and navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));

// Mock simple UI components
const Text = ({ children }) => children;
const View = ({ children }) => <>{children}</>;
const Button = ({ onPress, title }) => <button onClick={onPress}>{title}</button>;
const TextInput = (props) => <input {...props} />;

// Mocked Redux store
let mockStore = {
  user: null,
  session: null,
};
const mockDispatch = jest.fn((action) => {
  if (action.type === 'user/loginSuccess') {
    mockStore.user = action.payload;
  }
});
jest.mock('react-redux', () => ({
  useSelector: (selector) => selector(mockStore),
  useDispatch: () => mockDispatch,
}));


// --- Mocked Screens ---

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const dispatch = useDispatch();

  const handleSignUp = async () => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        dispatch({ type: 'user/loginSuccess', payload: data.user });
        navigation.navigate('Onboarding');
      }
    } catch (error) {
      // handle error
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" onChangeText={setEmail} value={email} testID="email-input" />
      <TextInput placeholder="Password" onChangeText={setPassword} value={password} testID="password-input" />
      <Button title="Sign Up" onPress={handleSignUp} testID="signup-button" />
    </View>
  );
};

const NewSoloPrepScreen = ({ navigation }) => {
    const user = mockStore.user;
    const [showPaywall, setShowPaywall] = React.useState(false);

    const handleStart = async () => {
        if (!user.isPremium && user.trials <= 0) {
            setShowPaywall(true);
            return;
        }
        const response = await fetch('/api/prompts?topic=misunderstanding');
        const data = await response.json();
        // In real app, would dispatch to set session prompts
        navigation.navigate('Journaling', { prompts: data.prompts });
    };

    const handleUpgrade = async () => {
        const response = await fetch('/api/subscribe', { method: 'POST' });
        if (response.ok) {
            mockStore.user.isPremium = true;
            setShowPaywall(false);
            handleStart(); // Retry starting the session
        }
    };

    return (
        <View>
            <Button title="Start Solo Prep" onPress={handleStart} testID="start-solo-prep-button" />
            {showPaywall && (
                <View testID="paywall-modal">
                    <Text>Upgrade to Premium</Text>
                    <Button title="Upgrade" onPress={handleUpgrade} testID="upgrade-button" />
                </View>
            )}
        </View>
    );
};


// --- MSW API Mock Server ---

const server = setupServer(
  rest.post('/api/register', (req, res, ctx) => {
    return res(
      ctx.json({
        user: { id: '1', email: 'test@example.com', isPremium: false, trials: 1 },
        token: 'fake-jwt-token',
      })
    );
  }),
  rest.post('/api/subscribe', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),
  rest.get('/api/prompts', (req, res, ctx) => {
      return res(ctx.json({ prompts: [{id: 1, text: 'Prompt 1?'}]}));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  mockStore = { user: null, session: null }; // Reset store
  mockDispatch.mockClear();
});
afterAll(() => server.close());


// --- Integration Tests ---

describe('User Authentication Flow', () => {
  it('allows a new user to register and logs them in', async () => {
    const mockNavigation = { navigate: jest.fn() };
    const { getByTestId } = render(<SignUpScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'a-secure-password');
    fireEvent.press(getByTestId('signup-button'));

    await waitFor(() => {
      // Check if Redux dispatch was called correctly
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'user/loginSuccess',
        payload: { id: '1', email: 'test@example.com', isPremium: false, trials: 1 },
      });
    });

    // Check if navigation was triggered
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Onboarding');
  });
});

describe('Solo Prep & Paywall Flow', () => {
    it('shows the paywall when a free user with no trials tries to start a session', async () => {
        mockStore.user = { id: '1', email: 'free@example.com', isPremium: false, trials: 0 };
        const mockNavigation = { navigate: jest.fn() };
        const { getByTestId, queryByTestId } = render(<NewSoloPrepScreen navigation={mockNavigation} />);

        expect(queryByTestId('paywall-modal')).toBeNull();

        fireEvent.press(getByTestId('start-solo-prep-button'));

        await waitFor(() => {
            expect(getByTestId('paywall-modal')).toBeTruthy();
        });

        expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('allows a premium user to start a session without seeing the paywall', async () => {
        mockStore.user = { id: '1', email: 'premium@example.com', isPremium: true, trials: 0 };
        const mockNavigation = { navigate: jest.fn() };
        const { getByTestId, queryByTestId } = render(<NewSoloPrepScreen navigation={mockNavigation} />);

        fireEvent.press(getByTestId('start-solo-prep-button'));

        await waitFor(() => {
            expect(mockNavigation.navigate).toHaveBeenCalledWith('Journaling', { prompts: [{id: 1, text: 'Prompt 1?'}]});
        });

        expect(queryByTestId('paywall-modal')).toBeNull();
    });

    it('allows a free user to upgrade via the paywall and start a session', async () => {
        mockStore.user = { id: '1', email: 'free@example.com', isPremium: false, trials: 0 };
        const mockNavigation = { navigate: jest.fn() };
        const { getByTestId } = render(<NewSoloPrepScreen navigation={mockNavigation} />);

        // Trigger the paywall
        fireEvent.press(getByTestId('start-solo-prep-button'));
        await waitFor(() => expect(getByTestId('paywall-modal')).toBeTruthy());

        // Click upgrade
        fireEvent.press(getByTestId('upgrade-button'));

        // Verify the app navigates to journaling after successful "purchase"
        await waitFor(() => {
            expect(mockNavigation.navigate).toHaveBeenCalledWith('Journaling', { prompts: [{id: 1, text: 'Prompt 1?'}]});
        });
    });
});