import { defineStore } from 'pinia';
import { ref } from 'vue';
import { slackAPI } from '@/services/slackService';

export const useSlackStore = defineStore('slack', () => {
  // State
  const integrations = ref([]);
  const selectedIntegration = ref(null);
  const channels = ref([]);
  const selectedChannel = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Actions
  const getAuthUrl = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await slackAPI.getAuthUrl();
      const { url, state } = response.data;

      // Save state to sessionStorage for verification
      sessionStorage.setItem('slack_oauth_state', state);

      return url;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to get auth URL';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const handleOAuthCallback = async (code, state) => {
    try {
      loading.value = true;
      error.value = null;

      // Verify state
      const savedState = sessionStorage.getItem('slack_oauth_state');
      if (savedState !== state) {
        throw new Error('Invalid state parameter');
      }

      const response = await slackAPI.handleCallback(code, state);
      const integration = response.data;

      // Add to integrations list
      integrations.value.push(integration);
      selectedIntegration.value = integration;

      // Clean up
      sessionStorage.removeItem('slack_oauth_state');

      return integration;
    } catch (err) {
      error.value = err.response?.data?.message || 'OAuth callback failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchIntegrations = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await slackAPI.getIntegrations();
      integrations.value = response.data;

      // Set first integration as selected if none selected
      if (integrations.value.length > 0 && !selectedIntegration.value) {
        selectedIntegration.value = integrations.value[0];
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch integrations';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteIntegration = async (integrationId) => {
    try {
      loading.value = true;
      error.value = null;

      await slackAPI.deleteIntegration(integrationId);

      // Remove from list
      integrations.value = integrations.value.filter(i => i.id !== integrationId);

      // Clear selection if deleted
      if (selectedIntegration.value?.id === integrationId) {
        selectedIntegration.value = integrations.value[0] || null;
        channels.value = [];
        selectedChannel.value = null;
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete integration';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchChannels = async (integrationId) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await slackAPI.getChannels(integrationId);
      channels.value = response.data;

      // Clear selected channel
      selectedChannel.value = null;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch channels';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const sendMessage = async (integrationId, channelId, text) => {
    try {
      loading.value = true;
      error.value = null;

      await slackAPI.sendMessage(integrationId, {
        channelId,
        text
      });

      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to send message';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const selectIntegration = async (integration) => {
    selectedIntegration.value = integration;
    selectedChannel.value = null;

    // Fetch channels for this integration
    if (integration) {
      await fetchChannels(integration.id);
    } else {
      channels.value = [];
    }
  };

  const selectChannel = (channel) => {
    selectedChannel.value = channel;
  };

  return {
    // State
    integrations,
    selectedIntegration,
    channels,
    selectedChannel,
    loading,
    error,

    // Actions
    getAuthUrl,
    handleOAuthCallback,
    fetchIntegrations,
    deleteIntegration,
    fetchChannels,
    sendMessage,
    selectIntegration,
    selectChannel
  };
});
