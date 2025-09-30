import React from 'react';
import styled from 'styled-components/native';
import { COLOR_SCHEMES } from '../../theme';

const StyledCard = styled.TouchableOpacity`
  background-color: ${({ scheme, theme }) => 
    scheme ? COLOR_SCHEMES[scheme].cardBg : theme.colors.surface};
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.medium}px;
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
  border-width: 1px;
  border-color: ${({ scheme, theme }) => 
    scheme ? COLOR_SCHEMES[scheme].cardBorder : theme.colors.border};
  shadow-color: ${({ scheme, theme }) => 
    scheme ? COLOR_SCHEMES[scheme].shadow : 'rgba(0, 0, 0, 0.1)'};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.2;
  shadow-radius: 8px;
  elevation: 4;
  backdrop-filter: blur(10px);
`;

const CardTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h6}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ scheme, theme }) => 
    scheme ? COLOR_SCHEMES[scheme].text : theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.extraSmall}px;
  text-shadow: ${({ scheme }) => scheme ? '1px 1px 2px rgba(0, 0, 0, 0.3)' : 'none'};
`;

const CardSubtitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ scheme, theme }) => 
    scheme ? COLOR_SCHEMES[scheme].textSecondary : theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
  text-shadow: ${({ scheme }) => scheme ? '1px 1px 2px rgba(0, 0, 0, 0.2)' : 'none'};
`;

const CardContent = styled.View`
  margin-top: ${({ theme, hasTitleOrSubtitle }) => (hasTitleOrSubtitle ? 0 : theme.spacing.extraSmall)}px;
`;

const Card = ({ children, title, subtitle, onPress, style, scheme, ...props }) => {
  const HasTitleOrSubtitle = !!title || !!subtitle;

  return (
    <StyledCard onPress={onPress} disabled={!onPress} style={style} scheme={scheme} {...props}>
      {title && <CardTitle scheme={scheme}>{title}</CardTitle>}
      {subtitle && <CardSubtitle scheme={scheme}>{subtitle}</CardSubtitle>}
      <CardContent hasTitleOrSubtitle={HasTitleOrSubtitle}>
        {children}
      </CardContent>
    </StyledCard>
  );
};

export default Card;
