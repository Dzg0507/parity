import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Platform, Linking, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import SubscriptionTierCard from '../../components/subscription/SubscriptionTierCard';
import { useGetSubscriptionStatusQuery } from '../../store/api/userApi';
import { useProcessSubscriptionPurchaseMutation, useRestorePurchasesMutation } from '../../store/api/subscriptionApi';
import { theme } from '../../theme';
// import * as RNIap from 'react-native-iap'; // TODO: Uncomment for mobile implementation
import { SUBSCRIPTION_PRODUCT_IDS } from '../../constants';

const Container = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.extraLarge,
    alignItems: 'center',
  },
}))`
  background-color: ${({ theme }) => theme.colors.background};
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h3}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
  width: 100%;
  text-align: center;
`;

const Subtitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.extraLarge}px;
  text-align: center;
  padding-horizontal: ${({ theme }) => theme.spacing.medium}px;
`;

const CurrentSubscriptionCard = styled(Card)`
  background-color: ${({ theme }) => theme.colors.primaryLight};
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
`;

const CurrentSubscriptionTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h5}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.extraSmall}px;
`;

const CurrentSubscriptionText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.white};
  line-height: 22px;
`;

const FeaturesList = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
  width: 100%;
  max-width: 400px;
`;

const FeatureItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const FeatureText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-left: ${({ theme }) => theme.spacing.small}px;
`;

const SectionTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h4}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
  text-align: center;
  width: 100%;
`;

const SubscriptionManagementPage = () => {
  const { data: subscriptionStatus, isLoading: isSubscriptionStatusLoading, refetch } = useGetSubscriptionStatusQuery();
  const [processSubscriptionPurchase, { isLoading: isProcessingPurchase }] = useProcessSubscriptionPurchaseMutation();
  const [restorePurchases, { isLoading: isRestoringPurchases }] = useRestorePurchasesMutation();

  const [products, setProducts] = useState([]);
  const [currentPurchase, setCurrentPurchase] = useState(null); // To store a pending purchase transaction
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');
  const [iapReady, setIapReady] = useState(false);

  // Initialize IAP
  useEffect(() => {
    const initIAP = async () => {
      try {
        // TODO: Uncomment for mobile implementation
        // await RNIap.initConnection();
        // if (Platform.OS === 'ios') {
        //   await RNIap.clearTransactionIOS(); // Clear any pending transactions on iOS
        // }
        // await RNIap.flushFailedPurchasesCachedAsPendingAndroid(); // Clear any pending transactions on Android
        console.log('IAP initialization skipped for web');
        setIapReady(true);
      } catch (err) {
        console.warn('IAP initConnection error:', err.code, err.message);
        setAlertMessage(`Error initializing in-app purchases: ${err.message}.`);
        setAlertVariant('error');
        setShowAlert(true);
        setIapReady(false);
      }
    };
    initIAP();

    // Listener for purchases
    // TODO: Uncomment for mobile implementation
    // const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
    //   console.log('purchaseUpdatedListener', purchase);
    //   setCurrentPurchase(purchase); // Store the purchase to process in useEffect
    // });

    // const purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
    //   console.warn('purchaseErrorListener', error);
    //   if (error.code !== 'E_USER_CANCELLED') {
    //     setAlertMessage(`Purchase error: ${error.message}`);
    //     setAlertVariant('error');
    //     setShowAlert(true);
    //   } else {
    //     setAlertMessage('Purchase cancelled.');
    //     setAlertVariant('info');
    //     setShowAlert(true);
    //   }
    //   setCurrentPurchase(null); // Clear any pending purchase on error
    // });

    return () => {
      // TODO: Uncomment for mobile implementation
      // purchaseUpdateSubscription?.remove();
      // purchaseErrorSubscription?.remove();
      // RNIap.endConnection();
    };
  }, []);

  // Process a confirmed purchase
  useEffect(() => {
    const handlePurchase = async () => {
      if (currentPurchase) {
        try {
          const receipt = currentPurchase.transactionReceipt;
          if (receipt) {
            console.log('Sending receipt to backend for validation...');
            await processSubscriptionPurchase({
              receiptData: receipt,
              productId: currentPurchase.productId,
            }).unwrap();
            // TODO: Uncomment for mobile implementation
            // await RNIap.finishTransaction(currentPurchase);
            setAlertMessage('Subscription activated successfully!');
            setAlertVariant('success');
            setShowAlert(true);
            refetch(); // Refetch subscription status from backend
          } else {
            throw new Error('No receipt found for the purchase.');
          }
        } catch (err) {
          console.error('Purchase validation failed:', err);
          setAlertMessage(err.data?.message || 'Subscription validation failed.');
          setAlertVariant('error');
          setShowAlert(true);
          // If backend validation fails, you might want to consider consuming/finishing the transaction anyway
          // or allow the user to retry. For simplicity, we finish it to avoid pending state.
          // TODO: Uncomment for mobile implementation
          // await RNIap.finishTransaction(currentPurchase);
        } finally {
          setCurrentPurchase(null);
        }
      }
    };
    handlePurchase();
  }, [currentPurchase, processSubscriptionPurchase, refetch]);


  // Load available products from IAP
  useEffect(() => {
    const getProducts = async () => {
      if (!iapReady) return;

      try {
        const productIds = Object.values(SUBSCRIPTION_PRODUCT_IDS);
        // TODO: Uncomment for mobile implementation
        // const fetchedProducts = await RNIap.getProducts({ skus: productIds });
        const fetchedProducts = []; // Placeholder for web
        console.log('Fetched products:', fetchedProducts);
        // Filter out non-subscription items if any, or ensure only our known subscription IDs are used
        setProducts(fetchedProducts.filter(p => productIds.includes(p.productId)));
      } catch (err) {
        console.warn('getProducts error:', err.code, err.message);
        setAlertMessage(`Error fetching products: ${err.message}`);
        setAlertVariant('error');
        setShowAlert(true);
      }
    };
    getProducts();
  }, [iapReady]);

  const handleBuySubscription = async (productId) => {
    try {
      if (!iapReady) {
        setAlertMessage('In-app purchases are not ready yet. Please try again in a moment.');
        setAlertVariant('error');
        setShowAlert(true);
        return;
      }
      console.log(`Attempting to buy product: ${productId}`);
      // TODO: Uncomment for mobile implementation
      // await RNIap.requestSubscription({ sku: productId });
      console.log('Purchase request skipped for web');
      // The purchaseUpdateListener will handle the rest
    } catch (err) {
      console.warn('requestSubscription error:', err.code, err.message);
      if (err.code === 'E_USER_CANCELLED') {
        setAlertMessage('Subscription purchase cancelled.');
      } else {
        setAlertMessage(`Failed to initiate purchase: ${err.message}`);
        setAlertVariant('error');
      }
      setShowAlert(true);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      if (!iapReady) {
        setAlertMessage('In-app purchases are not ready yet. Please try again in a moment.');
        setAlertVariant('error');
        setShowAlert(true);
        return;
      }
      // TODO: Uncomment for mobile implementation
      // const restored = await RNIap.getAvailablePurchases();
      const restored = []; // Placeholder for web
      console.log('Available purchases:', restored);

      if (restored && restored.length > 0) {
        const receipts = restored.map(p => p.transactionReceipt);
        await restorePurchases(receipts).unwrap();
        setAlertMessage('Purchases restored successfully!');
        setAlertVariant('success');
        setShowAlert(true);
        refetch();
      } else {
        setAlertMessage('No previous purchases found to restore.');
        setAlertVariant('info');
        setShowAlert(true);
      }
    } catch (err) {
      console.error('Restore purchases failed:', err);
      setAlertMessage(err.data?.message || 'Failed to restore purchases.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  };

  const openPlatformSubscriptionSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else if (Platform.OS === 'android') {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  const isPremium = subscriptionStatus?.tier === 'premium';
  const isLoadingAnything = isSubscriptionStatusLoading || isProcessingPurchase || isRestoringPurchases || !iapReady;

  return (
    <Container>
      <Alert
        visible={showAlert}
        message={alertMessage}
        variant={alertVariant}
        onDismiss={() => setShowAlert(false)}
      />

      <Title>Subscription</Title>
      <Subtitle>Manage your Parity Premium subscription to unlock all features.</Subtitle>

      {isLoadingAnything && !products.length ? (
        <Spinner />
      ) : (
        <>
          <CurrentSubscriptionCard>
            <CurrentSubscriptionTitle>
              Current Plan: {isPremium ? 'Parity Premium' : 'Free'}
            </CurrentSubscriptionTitle>
            <CurrentSubscriptionText>
              {isPremium
                ? `Your premium subscription is active until ${subscriptionStatus?.renewalDate ? new Date(subscriptionStatus.renewalDate).toLocaleDateString() : 'N/A'}.`
                : 'You are currently on the free plan. Enjoy Uplift mode and one free Solo Prep session.'}
            </CurrentSubscriptionText>
            {isPremium && (
              <Button
                title="Manage on App Store / Google Play"
                onPress={openPlatformSubscriptionSettings}
                variant="outline"
                style={{ marginTop: theme.spacing.medium }}
                textStyle={{ color: theme.colors.white }}
              />
            )}
          </CurrentSubscriptionCard>

          {!isPremium && (
            <>
              <SectionTitle>Upgrade to Parity Premium</SectionTitle>
              <FeaturesList>
                <FeatureItem>
                  <Icon name="check-circle" size={20} color={theme.colors.success} />
                  <FeatureText>Unlimited Solo Prep Sessions</FeatureText>
                </FeatureItem>
                <FeatureItem>
                  <Icon name="check-circle" size={20} color={theme.colors.success} />
                  <FeatureText>Unlimited Joint Unpack Sessions</FeatureText>
                </FeatureItem>
                <FeatureItem>
                  <Icon name="check-circle" size={20} color={theme.colors.success} />
                  <FeatureText>Access to all premium prompts and briefings</FeatureText>
                </FeatureItem>
                <FeatureItem>
                  <Icon name="check-circle" size={20} color={theme.colors.success} />
                  <FeatureText>Priority support</FeatureText>
                </FeatureItem>
              </FeaturesList>

              {products.length > 0 ? (
                products.map((product) => (
                  <SubscriptionTierCard
                    key={product.productId}
                    product={product}
                    onSelect={() => handleBuySubscription(product.productId)}
                    isLoading={isProcessingPurchase}
                  />
                ))
              ) : (
                <Card>
                  <CurrentSubscriptionText>
                    No subscription products found. Please try again later.
                  </CurrentSubscriptionText>
                </Card>
              )}
            </>
          )}

          <Button
            title="Restore Purchases"
            onPress={handleRestorePurchases}
            disabled={isRestoringPurchases || isLoadingAnything}
            loading={isRestoringPurchases}
            variant="secondary"
            style={{ marginTop: theme.spacing.extraLarge }}
          />

          <Button
            title="Manage on App Store / Google Play"
            onPress={openPlatformSubscriptionSettings}
            variant="outline"
            style={{ marginTop: theme.spacing.medium }}
          />
        </>
      )}
    </Container>
  );
};

export default SubscriptionManagementPage;
