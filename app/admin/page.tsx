'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Question } from '@/lib/types';

// Hard-coded admin email - replace with your email
const ADMIN_EMAIL = 'wschumeyerjr1@gmail.com';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    active_date: '',
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user is admin (simple email check for now)
      const userIsAdmin = user.email === ADMIN_EMAIL || (user.email?.endsWith('@yourdomain.com') ?? false);
      setIsAdmin(userIsAdmin);

      if (userIsAdmin) {
        await loadQuestions();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('active_date', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const questionData: any = {
        question_text: formData.question_text,
        option_a: formData.option_a,
        option_b: formData.option_b,
        active_date: formData.active_date,
      };

      if (formData.option_c) questionData.option_c = formData.option_c;
      if (formData.option_d) questionData.option_d = formData.option_d;

      const { error } = await supabase
        .from('questions')
        .insert([questionData]);

      if (error) throw error;

      alert('Question created successfully!');
      setFormData({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        active_date: '',
      });
      setShowForm(false);
      await loadQuestions();
    } catch (error: any) {
      alert(`Error creating question: ${error.message}`);
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

  if (!isAdmin) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-600">
          You don't have permission to access the admin panel.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Admin access is restricted to authorized users only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ New Question'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-200 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <textarea
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                required
                rows={3}
                className="input"
                placeholder="What's your opinion on..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option A *
                </label>
                <input
                  type="text"
                  value={formData.option_a}
                  onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                  required
                  className="input"
                  placeholder="First option"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option B *
                </label>
                <input
                  type="text"
                  value={formData.option_b}
                  onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                  required
                  className="input"
                  placeholder="Second option"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option C (optional)
                </label>
                <input
                  type="text"
                  value={formData.option_c}
                  onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                  className="input"
                  placeholder="Third option"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option D (optional)
                </label>
                <input
                  type="text"
                  value={formData.option_d}
                  onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                  className="input"
                  placeholder="Fourth option"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Active Date *
              </label>
              <input
                type="date"
                value={formData.active_date}
                onChange={(e) => setFormData({ ...formData, active_date: e.target.value })}
                required
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full"
            >
              {submitting ? 'Creating...' : 'Create Question'}
            </button>
          </form>
        )}
      </div>

      {/* Questions List */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">All Questions ({questions.length})</h3>

        {questions.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No questions yet. Create your first question to get started!
          </p>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => {
              const isPast = new Date(question.active_date) < new Date();
              const isToday = question.active_date === new Date().toISOString().split('T')[0];
              const isFuture = new Date(question.active_date) > new Date();

              return (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border-2 ${
                    isToday
                      ? 'border-green-500 bg-green-50'
                      : isPast
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-gray-900">{question.question_text}</div>
                    <div className="text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isToday
                            ? 'bg-green-600 text-white'
                            : isPast
                            ? 'bg-gray-400 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {isToday ? 'Today' : isPast ? 'Past' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Date: {new Date(question.active_date).toLocaleDateString()}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>A. {question.option_a}</div>
                    <div>B. {question.option_b}</div>
                    {question.option_c && <div>C. {question.option_c}</div>}
                    {question.option_d && <div>D. {question.option_d}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
