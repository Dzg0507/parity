import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Dimensions, FlatList, View } from 'react-native';
import Button from '../../components/common/Button';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');

const slideData = [
  {
    key: '1',
    title: 'Welcome to Parity',
    description: 'Your guide to more fulfilling relationships. Discover tools for self-reflection and shared understanding.',
    image: 'waving-hand', // Placeholder icon
  },
  {
    key: '2',
    title: 'Uplift Mode: Share Positivity',
    description: 'Explore a library of uplifting messages. Share encouragement, gratitude, and appreciation with anyone.',
    image: 'favorite', // Placeholder icon
  },
  {
    key: '3',
    title: 'Unpack Mode: Solo Prep',
    description: 'Prepare for important conversations. Journal privately using expert prompts and get a personalized strategy briefing.',
    image: 'self-improvement', // Placeholder icon
  },
  {
    key: '4',
    title: 'Unpack Mode: Joint Unpack',
    description: 'Invite someone to anonymously share their perspective on a topic. Reveal answers simultaneously for mutual understanding.',
    image: 'people', // Placeholder icon
  },
  {
    key: '5',
    title: 'Unlock Premium Features',
    description: 'Enjoy unlimited Solo Prep and Joint Unpack sessions with a Parity Premium subscription. Uplift mode is always free!',
    image: 'workspace-premium', // Placeholder icon
  },
];

const SlideContainer = styled.View`
  width: ${width}px;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.large}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const SlideImage = styled(Icon)`
  margin-bottom: ${({ theme }) => theme.spacing.extraLarge}px;
  color: ${({ theme }) => theme.colors.primary};
`;

const SlideTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h3}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
  text-align: center;
`;

const SlideDescription = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  line-height: 24px;
  margin-bottom: ${({ theme }) => theme.spacing.extraLarge}px;
  padding-horizontal: ${({ theme }) => theme.spacing.medium}px;
`;

const PaginationDot = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.grey400};
  margin-horizontal: ${({ theme }) => theme.spacing.tiny}px;
`;

const PaginationContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-vertical: ${({ theme }) => theme.spacing.large}px;
`;

const SkipButton = styled(Button)`
  position: absolute;
  top: ${({ theme }) => theme.spacing.large}px;
  right: ${({ theme }) => theme.spacing.large}px;
`;

const OnboardingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = React.useRef(null);
  const navigation = useNavigation();

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    if (currentIndex < slideData.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      // Last slide, finish onboarding
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    // In a real app, you'd save a flag to async storage so onboarding doesn't show again
    // For now, just navigate to the main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'UpliftLibrary' }], // Assuming Uplift is the default authenticated screen
    });
  };

  const renderItem = ({ item }) => (
    <SlideContainer>
      <SlideImage name={item.image} size={80} />
      <SlideTitle>{item.title}</SlideTitle>
      <SlideDescription>{item.description}</SlideDescription>
    </SlideContainer>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {currentIndex < slideData.length - 1 && (
        <SkipButton
          title="Skip"
          variant="outline"
          onPress={completeOnboarding}
          style={{ alignSelf: 'flex-end', margin: theme.spacing.medium, position: 'absolute', top: 0, right: 0 }}
          textStyle={{ fontSize: theme.typography.fontSizes.bodySmall }}
        />
      )}

      <FlatList
        ref={flatListRef}
        data={slideData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.key}
        style={{ flex: 1 }}
      />

      <PaginationContainer>
        {slideData.map((_, index) => (
          <PaginationDot key={index} active={index === currentIndex} />
        ))}
      </PaginationContainer>

      <Button
        title={currentIndex === slideData.length - 1 ? 'Get Started' : 'Next'}
        onPress={handleNext}
        style={{ marginHorizontal: theme.spacing.large, marginBottom: theme.spacing.extraLarge }}
      />
    </View>
  );
};

export default OnboardingPage;
