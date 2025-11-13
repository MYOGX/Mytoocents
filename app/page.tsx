'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Question, Answer, Profile, AnswerStats } from '@/lib/types';
import ResultsView from '@/components/ResultsView';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayQuestion, setTodayQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<Answer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Get or create profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, display_name: user.email }])
          .select()
          .single();

        if (createError) throw createError;
        profileData = newProfile;
      } else if (profileError) {
        throw profileError;
      }

      setProfile(profileData);

      // Get today's question
      const today = new Date().toISOString().split('T')[0];
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('active_date', today)
        .single();

      if (questionError && questionError.code !== 'PGRST116') {
        throw questionError;
      }

      setTodayQuestion(questionData);

      // Check if user has already answered today's question
      if (questionData) {
        const { data: answerData, error: answerError } = await supabase
          .from('answers')
          .select('*')
          .eq('user_id', user.id)
          .eq('question_id', questionData.id)
          .single();

        if (answerError && answerError.code !== 'PGRST116') {
          throw answerError;
        }

        setUserAnswer(answerData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (option: 'A' | 'B' | 'C' | 'D') => {
    if (!profile || !todayQuestion || submitting) return;

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check streak logic
      const today = new Date().toISOString().split('T')[0];
      const lastAnswerDate = profile.last_answer_date;
      let newStreak = profile.answer_streak;

      if (!lastAnswerDate) {
        newStreak = 1;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastAnswerDate === yesterdayStr) {
          newStreak = profile.answer_streak + 1;
        } else if (lastAnswerDate === today) {
          // Already answered today, shouldn't happen
          newStreak = profile.answer_streak;
        } else {
          // Streak broken
          newStreak = 1;
        }
      }

      // Insert answer
      const { data: answerData, error: answerError } = await supabase
        .from('answers')
        .insert([
          {
            user_id: user.id,
            question_id: todayQuestion.id,
            chosen_option: option,
          },
        ])
        .select()
        .single();

      if (answerError) throw answerError;

      // Insert reward transaction
      await supabase.from('reward_transactions').insert([
        {
          user_id: user.id,
          amount_cents: 2,
          type: 'earn_answer',
          meta: { question_id: todayQuestion.id },
        },
      ]);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          cents_balance: profile.cents_balance + 2,
          answer_streak: newStreak,
          last_answer_date: today,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card text-center">
        <p className="text-gray-600">Unable to load profile. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Summary */}
      <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-1">
              Hello, {profile.display_name || 'there'}!
            </h2>
            <p className="text-blue-100">Keep up the great work!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{profile.cents_balance} ¢</div>
            <div className="text-blue-100 text-sm">
              🔥 {profile.answer_streak} day streak
            </div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      {!todayQuestion ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className="text-2xl font-bold mb-2">No question for today yet</h2>
          <p className="text-gray-600">Check back later for today's question!</p>
        </div>
      ) : userAnswer ? (
        <div className="space-y-6">
          <div className="card">
            <div className="text-center py-6">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">Thanks for your 2 cents!</h2>
              <p className="text-gray-600">You've already answered today's question.</p>
              <p className="text-sm text-gray-500 mt-2">Come back tomorrow for a new question!</p>
            </div>
          </div>
          <ResultsView questionId={todayQuestion.id} userChoice={userAnswer.chosen_option} />
        </div>
      ) : (
        <div className="card">
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Today's Question</div>
            <h2 className="text-2xl font-bold mb-4">{todayQuestion.question_text}</h2>
            <p className="text-sm text-gray-600">Select your answer to earn 2 cents:</p>
          </div>

          <div className="space-y-3">
            {(['A', 'B', 'C', 'D'] as const).map((option) => {
              const optionText = todayQuestion[`option_${option.toLowerCase()}` as keyof Question];
              if (!optionText) return null;

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={submitting}
                  className="option-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <span className="font-bold text-blue-600 mr-3">{option}.</span>
                    <span>{optionText}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {submitting && (
            <div className="mt-4 text-center text-gray-600">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-blue-600 border-r-transparent mr-2"></div>
              Submitting your answer...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
