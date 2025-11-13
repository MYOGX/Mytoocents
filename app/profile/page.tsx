'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Profile, RewardTransaction } from '@/lib/types';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
      setDisplayName(profileData.display_name || '');

      // Load recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('reward_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;

      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      await loadProfile();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card text-center">
        <p className="text-gray-600">Unable to load profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Your Profile</h2>

        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Total Balance</div>
              <div className="text-3xl font-bold">{profile.cents_balance} ¢</div>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-red-600 rounded-lg p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Current Streak</div>
              <div className="text-3xl font-bold">🔥 {profile.answer_streak}</div>
            </div>
          </div>

          {/* Display Name Editor */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <div className="flex gap-2">
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input flex-1"
                placeholder="Enter your display name"
              />
              <button
                onClick={handleSave}
                disabled={saving || displayName === profile.display_name}
                className="btn btn-primary"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Last Answer Date */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">Last answer date:</span>{' '}
            {profile.last_answer_date
              ? new Date(profile.last_answer_date).toLocaleDateString()
              : 'Never'}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>

        {transactions.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No transactions yet. Answer your first question to get started!</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {tx.type === 'earn_answer' ? '📝 Answered Question' : tx.type}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(tx.created_at).toLocaleDateString()} at{' '}
                    {new Date(tx.created_at).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">
                  +{tx.amount_cents} ¢
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
