import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Spinner from '../../../components/common/Spinner';
import Alert from '../../../components/common/Alert';
import Button from '../../../components/common/Button';
import Prompt from '../../../components/unpack/Prompt';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  useGetJointUnpackInviteePromptsQuery,
  useSaveJointUnpackInviteeResponseMutation,
  useConfirmReadyToRevealMutation,
} from '../../../store/api/jointUnpackApi';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const HeaderContainer = styled.View`
  padding: ${({ theme }) => theme.spacing.medium}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h3}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
  text-align: center;
`;

const Subtitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  line-height: 24px;
`;

const PromptListContainer = styled.FlatList.attrs(() => ({
  contentContainerStyle: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.extraLarge * 2, // Ensure space for footer button
  },
}))``;

const ButtonContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${({ theme }) => theme.spacing.medium}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
`;

const GuestResponsePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId, invitationToken } = route.params || {}; // sessionId is the JointUnpackSessionId

  const { data: promptsData, isLoading: isLoadingPrompts, error: promptsError } = useGetJointUnpackInviteePromptsQuery(sessionId, {
    skip: !sessionId,
  });
  const [saveInviteeResponse, { isLoading: isSavingResponse, error: saveResponseError }] = useSaveJointUnpackInviteeResponseMutation();
  const [confirmReadyToReveal, { isLoading: isConfirmingReady, error: confirmError }] = useConfirmReadyToRevealMutation();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');

  useEffect(() => {
    if (promptsError) {
      setAlertMessage(promptsError.data?.message || 'Failed to load prompts for this session.');
      setAlertVariant('error');
      setShowAlert(true);
    }
    if (saveResponseError) {
      setAlertMessage(saveResponseError.data?.message || 'Failed to save your response.');
      setAlertVariant('error');
      setShowAlert(true);
    }
    if (confirmError) {
      setAlertMessage(confirmError.data?.message || 'Failed to confirm readiness for reveal.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  }, [promptsError, saveResponseError, confirmError]);

  const handleSaveEntry = async (promptId, entryContent) => {
    try {
      await saveInviteeResponse({ sessionId, promptId, response: entryContent, invitationToken }).unwrap();
      // Optionally, show a brief success toast/message here
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleCompleteResponses = async (values) => {
    setShowAlert(false);
    try {
      // Ensure all responses are saved first (if not already handled by onBlur auto-save)
      // This might involve iterating through values and calling `saveInviteeResponse` for each.
      // For now, assuming onBlur takes care of individual saves, and this is just to confirm readiness.
      await confirmReadyToReveal(sessionId).unwrap();
      setAlertMessage('Your responses are complete and you are ready to reveal!');
      setAlertVariant('success');
      setShowAlert(true);
      navigation.replace('JointUnpackReveal', { sessionId, invitationToken, isInitiator: false });
    } catch (err) {
      // Error handled by useEffect
    }
  };

  if (isLoadingPrompts) {
    return <Spinner />;
  }

  if (promptsError) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Alert
          visible={showAlert}
          message={alertMessage}
          variant={alertVariant}
          onDismiss={() => setShowAlert(false)}
        />
        <Title>Error</Title>
        <Subtitle>Unable to load prompts for this session.</Subtitle>
      </Container>
    );
  }

  const prompts = promptsData?.prompts || [];
  const initialEntries = promptsData?.inviteeResponses || {}; // Existing responses from API

  const formikInitialValues = prompts.reduce((acc, prompt) => {
    acc[`response_${prompt.id}`] = initialEntries?.[prompt.id] || '';
    return acc;
  }, {});

  const formikValidationSchema = Yup.object().shape(
    prompts.reduce((acc, prompt) => {
      acc[`response_${prompt.id}`] = Yup.string().required(`Response for "${prompt.question}" is required`);
      return acc;
    }, {})
  );

  const renderPrompt = ({ item, index, formikProps }) => {
    const { handleChange, handleBlur, values, errors, touched } = formikProps;
    const responseKey = `response_${item.id}`;

    return (
      <Prompt
        promptNumber={index + 1}
        question={item.question}
        value={values[responseKey]}
        onChangeText={handleChange(responseKey)}
        onBlur={() => {
          handleBlur(responseKey);
          if (touched[responseKey] && !errors[responseKey]) {
            handleSaveEntry(item.id, values[responseKey]);
          }
        }}
        error={touched[responseKey] && errors[responseKey]}
      />
    );
  };

  return (
    <Container>
      <Alert
        visible={showAlert}
        message={alertMessage}
        variant={alertVariant}
        onDismiss={() => setShowAlert(false)}
      />

      <HeaderContainer>
        <Title>Your Perspective</Title>
        <Subtitle>
          Privately respond to these prompts. Your answers are secure and won't be revealed until both you and your partner consent.
        </Subtitle>
      </HeaderContainer>

      <Formik
        initialValues={formikInitialValues}
        validationSchema={formikValidationSchema}
        onSubmit={handleCompleteResponses}
        enableReinitialize={true}
      >
        {(formikProps) => (
          <>
            <PromptListContainer
              data={prompts}
              renderItem={({ item, index }) => renderPrompt({ item, index, formikProps })}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
            <ButtonContainer>
              <Button
                title="I'm Ready to Reveal"
                onPress={formikProps.handleSubmit}
                disabled={!formikProps.isValid || isSavingResponse || isConfirmingReady}
                loading={isSavingResponse || isConfirmingReady}
              />
            </ButtonContainer>
          </>
        )}
      </Formik>
    </Container>
  );
};

export default GuestResponsePage;
