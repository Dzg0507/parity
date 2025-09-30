describe('Parity App Full User Journey', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true });
  });

  it('should allow a user to register, complete onboarding, and land on the dashboard', async () => {
    await waitFor(element(by.id('signup-link'))).toBeVisible().withTimeout(10000);
    await element(by.id('signup-link')).tap();

    const email = `testuser_${Date.now()}@example.com`;
    await element(by.id('email-input')).typeText(email);
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('register-button')).tap();

    // Onboarding
    await waitFor(element(by.id('onboarding-screen-1'))).toBeVisible().withTimeout(5000);
    await element(by.id('next-button')).tap();
    await waitFor(element(by.id('onboarding-screen-2'))).toBeVisible();
    await element(by.id('finish-button')).tap();

    // Dashboard
    await waitFor(element(by.id('dashboard-screen'))).toBeVisible();
    await expect(element(by.id('welcome-message'))).toBeVisible();
  });

  it('should allow a user to browse and select an Uplift message', async () => {
    await element(by.id('uplift-tab')).tap();
    await waitFor(element(by.id('uplift-library-screen'))).toBeVisible();

    // Wait for categories to load
    await waitFor(element(by.id('category-Gratitude'))).toBeVisible();
    await element(by.id('category-Gratitude')).tap();

    // Wait for messages to load and tap the first one
    await waitFor(element(by.id('message-card-0'))).toBeVisible();
    await element(by.id('message-card-0')).tap();

    // Expect to see message detail/share screen
    await waitFor(element(by.id('share-message-button'))).toBeVisible();
    await expect(element(by.id('share-message-button'))).toBeVisible();

    // Go back to dashboard
    await element(by.id('dashboard-tab')).tap();
  });

  it('should complete a Solo Prep session and view the Strategy Briefing', async () => {
    // This test assumes the user has a premium subscription or a free trial available.
    await element(by.id('unpack-tab')).tap();
    await element(by.id('start-solo-prep-button')).tap();

    // Session Setup Screen
    await waitFor(element(by.id('relationship-selector'))).toBeVisible();
    await element(by.id('relationship-selector')).tap();
    await element(by.text('Partner')).tap(); // Assumes a dropdown/modal with this option

    await element(by.id('topic-selector')).tap();
    await element(by.text('Resolving a Misunderstanding')).tap();

    await element(by.id('begin-journaling-button')).tap();

    // Journaling Screen
    await waitFor(element(by.id('journal-screen'))).toBeVisible();

    // Fill out prompts
    await element(by.id('prompt-textarea-0')).typeText('My response to the first prompt.');
    await element(by.id('next-prompt-button')).tap();
    await element(by.id('prompt-textarea-1')).typeText('My response to the second prompt.');
    await element(by.id('next-prompt-button')).tap();
    await element(by.id('prompt-textarea-2')).typeText('My final response.');

    await element(by.id('finish-session-button')).tap();

    // Strategy Briefing Screen
    await waitFor(element(by.id('strategy-briefing-screen'))).toBeVisible().withTimeout(15000); // Generation might take time
    await expect(element(by.id('briefing-title'))).toHaveText('Your Strategy Briefing');
    await expect(element(by.id('briefing-content'))).toBeVisible();
  });

  it('should initiate a Joint Unpack session from a completed Solo Prep', async () => {
    // This test continues from the previous one, assuming we are on the Strategy Briefing screen.
    await expect(element(by.id('initiate-joint-unpack-button'))).toBeVisible();
    await element(by.id('initiate-joint-unpack-button')).tap();

    // Joint Unpack Dashboard
    await waitFor(element(by.id('joint-unpack-dashboard-screen'))).toBeVisible();
    await expect(element(by.id('invitee-status-indicator'))).toHaveLabel('Status: Invited');
    await expect(element(by.id('invitation-link-input'))).toBeVisible(); // Check that a link was generated
    await expect(element(by.id('share-invitation-button'))).toBeVisible();
  });

  it('should show the paywall when a free user runs out of trials', async () => {
    // This test requires specific app state (e.g., relaunching as a free user with 0 trials)
    await device.launchApp({
        newInstance: true,
        permissions: { notifications: 'YES' },
        launchArgs: { mockUser: 'free_no_trials' } // App must be configured to handle this
    });

    await element(by.id('unpack-tab')).tap();
    await element(by.id('start-solo-prep-button')).tap();

    // Expect the paywall to appear
    await waitFor(element(by.id('paywall-modal'))).toBeVisible().withTimeout(5000);
    await expect(element(by.text('Unlock Unlimited Sessions'))).toBeVisible();
    await element(by.id('close-paywall-button')).tap(); // Close it to end the test
  });
});