'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Question, AnswerStats } from '@/lib/types';

interface ResultsViewProps {
  questionId: string;
  userChoice: 'A' | 'B' | 'C' | 'D';
}

export default function ResultsView({ questionId, userChoice }: ResultsViewProps) {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [stats, setStats] = useState<AnswerStats[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    loadResults();
  }, [questionId]);

  const loadResults = async () => {
    try {
      // Get question details
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single();

      if (questionError) throw questionError;
      setQuestion(questionData);

      // Get all answers for this question
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('chosen_option')
        .eq('question_id', questionId);

      if (answersError) throw answersError;

      // Calculate statistics
      const optionCounts: { [key: string]: number } = {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
      };

      answersData.forEach((answer) => {
        optionCounts[answer.chosen_option]++;
      });

      const total = answersData.length;
      setTotalVotes(total);

      const statsArray: AnswerStats[] = [];
      (['A', 'B', 'C', 'D'] as const).forEach((option) => {
        const optionText = questionData[`option_${option.toLowerCase()}` as keyof Question];
        if (optionText) {
          statsArray.push({
            option,
            count: optionCounts[option],
            percentage: total > 0 ? (optionCounts[option] / total) * 100 : 0,
          });
        }
      });

      setStats(statsArray);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-6">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Results</h3>
        <p className="text-gray-600">Here's how the community voted:</p>
        <p className="text-sm text-gray-500 mt-1">{totalVotes} total votes</p>
      </div>

      <div className="space-y-4">
        {stats.map((stat) => {
          const isUserChoice = stat.option === userChoice;
          const optionText = question[`option_${stat.option.toLowerCase()}` as keyof Question];

          return (
            <div
              key={stat.option}
              className={`relative p-4 rounded-lg border-2 ${
                isUserChoice
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">{stat.option}.</span>
                  <span className="text-gray-900">{optionText}</span>
                  {isUserChoice && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                      Your choice
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {stat.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">{stat.count} votes</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isUserChoice ? 'bg-blue-600' : 'bg-gray-400'
                  }`}
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
