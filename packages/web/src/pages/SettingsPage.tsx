import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';

interface PreferencesResponse {
  emailNotifications: boolean;
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch current preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const response = await api.get<PreferencesResponse>(
        '/users/me/preferences',
      );
      return response.data;
    },
    enabled: !!user,
  });

  // Mutation for updating preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (emailNotifications: boolean) => {
      const response = await api.patch<PreferencesResponse>(
        '/users/me/preferences',
        {
          emailNotifications,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      setShowSuccess(true);
      setShowError(false);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update preferences';
      setErrorMessage(message);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    },
  });

  const handleToggleNotifications = (checked: boolean) => {
    updatePreferencesMutation.mutate(checked);
  };

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your notification preferences</p>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <p className="font-medium">Success!</p>
          <p className="text-sm">Your preferences have been updated.</p>
        </div>
      )}

      {/* Error Toast */}
      {showError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <p className="font-medium">Error</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Settings Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-6">Notification Preferences</h2>

        {preferencesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading preferences...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Email Notifications
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Receive email notifications about expiring points
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={preferences?.emailNotifications ?? true}
                  onChange={(e) => handleToggleNotifications(e.target.checked)}
                  disabled={updatePreferencesMutation.isPending}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* Loading indicator for mutation */}
            {updatePreferencesMutation.isPending && (
              <div className="text-sm text-gray-500 text-center py-2">
                Updating preferences...
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            These settings help us respect your communication preferences while
            keeping you informed about important events related to your loyalty
            points.
          </p>
        </div>
      </div>

      {/* Back to Home */}
      <div className="mt-6">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
