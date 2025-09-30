import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SearchBar from '../../components/common/SearchBar';
import CategoryFilter from '../../components/uplift/CategoryFilter';
import MessageList from '../../components/uplift/MessageList';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import ThemeSelector from '../../components/common/ThemeSelector';
import { useTheme } from '../../contexts/ThemeContext';
import { COLOR_SCHEMES } from '../../theme';
import {
  useGetUpliftMessageCategoriesQuery,
  useGetUpliftMessagesByCategoryQuery,
  useSearchUpliftMessagesQuery,
} from '../../store/api/upliftApi';

const GradientBackground = styled(LinearGradient).attrs(({ scheme }) => ({
  colors: COLOR_SCHEMES[scheme].primary,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
}))`
  flex: 1;
`;

const Container = styled.View`
  flex: 1;
  background-color: transparent;
`;

const UpliftLibraryPage = () => {
  const { currentScheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // null for 'All'
  const [displayedMessages, setDisplayedMessages] = useState([]);

  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useGetUpliftMessageCategoriesQuery();
  const {
    data: messagesByCategory,
    isLoading: isLoadingMessagesByCategory,
    error: messagesByCategoryError,
  } = useGetUpliftMessagesByCategoryQuery(selectedCategoryId, { skip: !!searchTerm });
  const {
    data: searchedMessages,
    isLoading: isLoadingSearchedMessages,
    error: searchedMessagesError,
  } = useSearchUpliftMessagesQuery(searchTerm, { skip: !searchTerm });

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');

  useEffect(() => {
    if (searchTerm) {
      setDisplayedMessages(searchedMessages || []);
    } else {
      setDisplayedMessages(messagesByCategory || []);
    }
  }, [searchTerm, messagesByCategory, searchedMessages]);

  useEffect(() => {
    if (categoriesError) {
      setAlertMessage(categoriesError.data?.message || 'Failed to load categories.');
      setAlertVariant('error');
      setShowAlert(true);
    }
    if (messagesByCategoryError) {
      setAlertMessage(messagesByCategoryError.data?.message || 'Failed to load messages.');
      setAlertVariant('error');
      setShowAlert(true);
    }
    if (searchedMessagesError) {
      setAlertMessage(searchedMessagesError.data?.message || 'Failed to search messages.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  }, [categoriesError, messagesByCategoryError, searchedMessagesError]);

  const handleShareMessage = (messageId) => {
    // You can log the share event or specific message ID if needed
    console.log(`Message with ID ${messageId} was shared.`);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedCategoryId(null); // Reset category filter when clearing search
  };

  return (
    <GradientBackground scheme={currentScheme}>
      <Container>
        <Alert
          visible={showAlert}
          message={alertMessage}
          variant={alertVariant}
          onDismiss={() => setShowAlert(false)}
        />

        <ThemeSelector />

        <SearchBar
          placeholder="Search uplifting messages..."
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
            setSelectedCategoryId(null); // Clear category selection when searching
          }}
          onClear={handleClearSearch}
        />

        {isLoadingCategories ? (
          <Spinner />
        ) : (
          <CategoryFilter
            categories={Array.isArray(categories) ? categories : []}
            selectedCategory={selectedCategoryId}
            onSelectCategory={(id) => {
              setSelectedCategoryId(id);
              setSearchTerm(''); // Clear search term when selecting a category
            }}
          />
        )}

        <MessageList
          messages={displayedMessages}
          isLoading={isLoadingMessagesByCategory || isLoadingSearchedMessages}
          error={messagesByCategoryError || searchedMessagesError}
          onShare={handleShareMessage}
        />
      </Container>
    </GradientBackground>
  );
};

export default UpliftLibraryPage;
