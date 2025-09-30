import React from 'react';
import styled from 'styled-components/native';
import Card from '../common/Card';
import Button from '../common/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';

const StyledSubscriptionTierCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
  width: 100%;
  max-width: 400px;
`;

const PriceText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h4}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primaryDark};
  margin-bottom: ${({ theme }) => theme.spacing.tiny}px;
`;

const PeriodText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
`;

const DescriptionText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodySmall}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const SubscriptionTierCard = ({ product, onSelect, isLoading }) => {
  if (!product) {
    return null;
  }

  // Helper to determine the period from product ID, or use subscriptionPeriod if available
  const getPeriodText = (productId) => {
    if (productId.includes('monthly')) return 'per month';
    if (productId.includes('annual')) return 'per year';
    return product.subscriptionPeriodUnit ? `per ${product.subscriptionPeriodUnit.toLowerCase()}` : '';
  };

  const periodText = product.subscriptionPeriod ? product.localizedSubscriptionPeriod : getPeriodText(product.productId);

  return (
    <StyledSubscriptionTierCard>
      <PriceText>{product.localizedPrice} {periodText}</PriceText>
      <PeriodText>{product.title}</PeriodText>
      {product.description && <DescriptionText>{product.description}</DescriptionText>}
      <Button
        title={`Subscribe ${product.localizedPrice}`}
        onPress={() => onSelect(product.productId)}
        loading={isLoading}
        disabled={isLoading}
        style={{ marginTop: theme.spacing.small }}
      />
    </StyledSubscriptionTierCard>
  );
};

export default SubscriptionTierCard;
