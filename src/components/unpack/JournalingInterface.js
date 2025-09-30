import React, { useState } from 'react';
import styled from 'styled-components/native';
import { FlatList, View, Alert as RNAlert } from 'react-native';
import Prompt from './Prompt';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Alert from '../common/Alert';
import { useSaveSoloPrepJournalEntryMutation } from '../../store/api/soloPrepApi';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { theme } from '../../theme';

const Container = styled.View`
  flex: 1;
  width: 100%;
  padding-horizontal: ${({ theme }) => theme.spacing.medium}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ButtonContainer = styled.View`
  padding: ${({ theme }) => theme.spacing.medium}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
`;

const PersonalizedHeader = styled.View`
  background-color: ${({ theme }) => theme.colors.primary}15;
  padding: ${({ theme }) => theme.spacing.medium}px;
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
  border-radius: 12px;
  border-left-width: 4px;
  border-left-color: ${({ theme }) => theme.colors.primary};
`;

const HeaderTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h4}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const HeaderText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.body}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 20px;
`;

const JournalingInterface = ({ sessionId, prompts, initialEntries, onSessionComplete, onJournalUpdate, isSavingAll, relationshipInfo }) => {
  const [saveJournalEntry, { isLoading: isSavingEntry }] = useSaveSoloPrepJournalEntryMutation();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');

  // Dynamically create initial values and validation schema for Formik
  const initialValues = prompts.reduce((acc, prompt) => {
    acc[`entry_${prompt.id}`] = initialEntries?.[prompt.id] || '';
    return acc;
  }, {});

  const validationSchema = Yup.object().shape(
    prompts.reduce((acc, prompt) => {
      acc[`entry_${prompt.id}`] = Yup.string().required(`Response for "${prompt.question}" is required`);
      return acc;
    }, {})
  );

  const handleSaveEntry = async (promptId, entryContent) => {
    try {
      await saveJournalEntry({ sessionId, promptId, entry: entryContent }).unwrap();
      // No alert for individual save, as it might be too frequent.
      // A small toast/notification might be better or rely on auto-save indicator.
    } catch (err) {
      console.error(`Failed to save entry for prompt ${promptId}:`, err);
      setAlertMessage(err.data?.message || 'Failed to save entry. Please try again.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  };

  const handleValuesChange = (values) => {
    if (onJournalUpdate) {
      // Convert form values to journal entries format
      const entries = Object.entries(values).map(([key, value]) => ({
        promptId: key.replace('entry_', ''),
        response: value,
        encryptedResponse: value // For now, treat as plain text
      }));
      onJournalUpdate(entries);
    }
  };

  const renderPrompt = ({ item, index, formikProps }) => {
    const { handleChange, handleBlur, values, errors, touched } = formikProps;
    const entryKey = `entry_${item.id}`;

    return (
      <Prompt
        promptNumber={index + 1}
        question={item.question}
        value={values[entryKey]}
        onChangeText={handleChange(entryKey)}
        onBlur={() => {
          handleBlur(entryKey);
          // Auto-save on blur
          if (touched[entryKey] && !errors[entryKey]) {
            handleSaveEntry(item.id, values[entryKey]);
          }
        }}
        error={touched[entryKey] && errors[entryKey]}
      />
    );
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => onSessionComplete(values)}
      enableReinitialize={true} // Re-initialize if prompts change (e.g., initial load)
    >
      {(formikProps) => {
        // Call onJournalUpdate when values change
        React.useEffect(() => {
          handleValuesChange(formikProps.values);
        }, [formikProps.values]);

        return (
          <Container>
            <Alert
              visible={showAlert}
              message={alertMessage}
              variant={alertVariant}
              onDismiss={() => setShowAlert(false)}
            />

            {relationshipInfo && (
              <PersonalizedHeader>
                <HeaderTitle>Personalized for your conversation</HeaderTitle>
                <HeaderText>
                  {relationshipInfo.your_name && relationshipInfo.their_name && 
                    `Hi ${relationshipInfo.your_name}! You're preparing to talk with ${relationshipInfo.their_name}. `}
                  {relationshipInfo.conversation_importance && 
                    `This is a ${relationshipInfo.conversation_importance.toLowerCase()}. `}
                  {relationshipInfo.conversation_goals && 
                    `Your goal: ${relationshipInfo.conversation_goals.toLowerCase()}. `}
                  {relationshipInfo.communication_style && 
                    `You communicate best by being ${relationshipInfo.communication_style.toLowerCase()}.`}
                </HeaderText>
              </PersonalizedHeader>
            )}

            <FlatList
              data={prompts}
              renderItem={({ item, index }) => renderPrompt({ item, index, formikProps })}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: theme.spacing.large }}
            />
            <ButtonContainer>
              <Button
                title="Complete Session & Get Briefing"
                onPress={formikProps.handleSubmit}
                disabled={!formikProps.isValid || isSavingEntry || isSavingAll}
                loading={isSavingEntry || isSavingAll}
              />
            </ButtonContainer>
          </Container>
        );
      }}
    </Formik>
  );
};

export default JournalingInterface;
