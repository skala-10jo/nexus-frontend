import { defineStore } from 'pinia';
import { ref } from 'vue';
import { slackAPI } from '@/services/slackService';

export const useSlackStore = defineStore('slack', () => {
  // State (1:1 relationship - single integration per user)
  const integration = ref(null);
  const isConnected = ref(false);
  const channels = ref([]);
  const selectedChannel = ref(null);
  const messages = ref([]);
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
      integration.value = response.data;
      isConnected.value = true;

      // Clean up
      sessionStorage.removeItem('slack_oauth_state');

      return integration.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'OAuth callback failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchIntegrationStatus = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await slackAPI.getIntegrationStatus();
      integration.value = response.data;
      isConnected.value = response.data.isActive || false;
    } catch (err) {
      // Not connected or error
      integration.value = null;
      isConnected.value = false;

      // Don't throw error if just not connected (404)
      if (err.response?.status !== 404) {
        error.value = err.response?.data?.message || 'Failed to fetch integration status';
      }
    } finally {
      loading.value = false;
    }
  };

  const disconnectIntegration = async () => {
    try {
      loading.value = true;
      error.value = null;

      await slackAPI.disconnectIntegration();

      // Clear state
      integration.value = null;
      isConnected.value = false;
      channels.value = [];
      selectedChannel.value = null;
      messages.value = [];
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to disconnect integration';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchChannels = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await slackAPI.getChannels();
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

  const sendMessage = async (channelId, text) => {
    try {
      loading.value = true;
      error.value = null;

      await slackAPI.sendMessage({
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

  const selectChannel = async (channel) => {
    selectedChannel.value = channel;
    messages.value = [];

    // Fetch message history when channel is selected
    if (channel) {
      await fetchMessageHistory(channel.id);
    }
  };

  const fetchMessageHistory = async (channelId) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await slackAPI.getMessageHistory(channelId);
      messages.value = response.data.reverse(); // Reverse to show oldest first

      return messages.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch message history';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    integration,
    isConnected,
    channels,
    selectedChannel,
    messages,
    loading,
    error,

    // Actions
    getAuthUrl,
    handleOAuthCallback,
    fetchIntegrationStatus,
    disconnectIntegration,
    fetchChannels,
    sendMessage,
    selectChannel,
    fetchMessageHistory
  };
});
