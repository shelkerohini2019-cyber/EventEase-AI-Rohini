import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  Send,
  HelpCircle,
  Bookmark,
  Check,
  RotateCw,
  Compass,
  Gift,
  Smile,
  Wine,
  Scissors,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { EventData } from '../types/event';
import { generateCreativeIdeas, askEventAdvice } from '../services/api';

interface PersonalizedIdeasViewProps {
  event: EventData;
  onSaveIdeaToPlan?: (idea: { title: string; category: any; idea: string; whyItWorks: string }) => void;
}

interface IdeaItem {
  title: string;
  category: string;
  description: string;
  costLevel: string;
  executionTip: string;
}

export const PersonalizedIdeasView: React.FC<PersonalizedIdeasViewProps> = ({
  event,
  onSaveIdeaToPlan,
}) => {
  const [selectedTopic, setSelectedTopic] = useState('Surprise Moments');
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [savedIdeaIndices, setSavedIdeaIndices] = useState<number[]>([]);

  // Planner Q&A state
  const [question, setQuestion] = useState('');
  const [isAskingAdvice, setIsAskingAdvice] = useState(false);
  const [adviceResponse, setAdviceResponse] = useState<string | null>(null);

  // Initial creative ideas
  const [ideas, setIdeas] = useState<IdeaItem[]>([
    {
      title: 'Acoustic Sunset Transition',
      category: 'Surprise Moments',
      description: 'Have a solo acoustic musician quietly step onto the floor playing a heartfelt, romantic melody right as twilight approaches to naturally transition guests from afternoon mingling into dinner.',
      costLevel: '$$',
      executionTip: 'Dim perimeter lights in synchronization with the music starting.',
    },
    {
      title: 'Lavender & Wildflower Seed Packet Favors',
      category: 'Favors & Keepsakes',
      description: 'Custom glassine envelopes filled with pollinator-friendly seeds stamped with your event monogram: "Plant these and watch our memories bloom".',
      costLevel: '$',
      executionTip: 'Order raw organic seeds in bulk and host a 30-minute packing night with friends.',
    },
    {
      title: 'Table Story Cards instead of Numbers',
      category: 'DIY Decor Hacks',
      description: 'Name each dining table after a favorite memory, meaningful date, or travel milestone with a framed photo and 2-sentence story.',
      costLevel: '$',
      executionTip: 'Guests will naturally walk around to read other tables’ cards, breaking the ice immediately.',
    },
    {
      title: 'Signature "Midnight Comfort Snack" Surprise',
      category: 'Food & Drinks',
      description: 'Pass around warm miniature grilled cheeses with tomato soup shooters or freshly baked warm cookies at 10 PM on the dance floor.',
      costLevel: '$$',
      executionTip: 'Prepare with catering staff ahead; servers carry trays straight into the crowd.',
    },
  ]);

  const handleFetchIdeas = async (topic: string) => {
    setSelectedTopic(topic);
    setIsLoadingIdeas(true);
    try {
      const res = await generateCreativeIdeas({
        eventType: event.eventType,
        vibePreference: event.vibePreference,
        topic: topic,
        budget: event.totalBudget,
        guestCount: event.guestCount,
      });
      if (res.ideas && res.ideas.length > 0) {
        setIdeas(res.ideas);
        setSavedIdeaIndices([]);
      }
    } catch (err) {
      console.error('Failed to generate ideas:', err);
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  const handleAskAdvice = async (customQ?: string) => {
    const qToAsk = customQ || question;
    if (!qToAsk.trim()) return;

    setIsAskingAdvice(true);
    setAdviceResponse(null);
    try {
      const res = await askEventAdvice({
        question: qToAsk,
        eventSummary: {
          name: event.name,
          eventType: event.eventType,
          guestCount: event.guestCount,
          totalBudget: event.totalBudget,
          location: event.location,
          vibePreference: event.vibePreference,
        },
      });
      setAdviceResponse(res.answer);
    } catch (err) {
      setAdviceResponse('Unable to retrieve advice at the moment. Please verify network connection or configure your API key.');
    } finally {
      setIsAskingAdvice(false);
    }
  };

  const handleSaveIdea = (idea: IdeaItem, idx: number) => {
    if (onSaveIdeaToPlan) {
      onSaveIdeaToPlan({
        title: idea.title,
        category: 'moment',
        idea: idea.description,
        whyItWorks: idea.executionTip,
      });
    }
    setSavedIdeaIndices((prev) => [...prev, idx]);
  };

  const quickQuestions = [
    `How to cut 20% from catering for ${event.guestCount} guests?`,
    'Best icebreakers for guests who do not know each other',
    'Outdoor rain contingency plan & setup steps',
    'Modern playlist pacing from cocktail hour to dancing',
  ];

  return (
    <div className="space-y-8">
      {/* Header & Sparker Bar */}
      <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-purple-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <Lightbulb className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Personalized Creative Ideas
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              AI-generated concepts, games, signature drinks, and DIY hacks tuned to your {event.eventType}
            </p>
          </div>

          <button
            onClick={() => handleFetchIdeas(selectedTopic)}
            disabled={isLoadingIdeas}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isLoadingIdeas ? 'animate-spin' : ''}`} />
            <span>{isLoadingIdeas ? 'Sparking...' : 'Spark Fresh Ideas'}</span>
          </button>
        </div>

        {/* Category Topic Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            'Surprise Moments',
            'DIY Decor Hacks',
            'Games & Icebreakers',
            'Signature Drinks',
            'Favors & Keepsakes',
            'Cost-Saving Hacks',
          ].map((topic) => (
            <button
              key={topic}
              onClick={() => handleFetchIdeas(topic)}
              className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition cursor-pointer ${
                selectedTopic === topic
                  ? 'bg-purple-600 text-white font-semibold shadow-xs'
                  : 'bg-purple-50/60 text-slate-600 hover:bg-purple-100'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Ideas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ideas.map((idea, idx) => {
          const isSaved = savedIdeaIndices.includes(idx);

          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-purple-100/90 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {idea.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Cost: <span className="text-purple-700">{idea.costLevel}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{idea.title}</h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {idea.description}
                </p>
              </div>

              <div className="pt-3 border-t border-purple-50 space-y-3">
                <div className="p-2.5 rounded-xl bg-purple-50/40 border border-purple-100/70 text-[11px] text-purple-950">
                  <span className="font-bold text-purple-700">★ Execution Tip: </span>
                  <span>{idea.executionTip}</span>
                </div>

                {onSaveIdeaToPlan && (
                  <button
                    onClick={() => handleSaveIdea(idea, idx)}
                    disabled={isSaved}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    <span>{isSaved ? 'Saved to Event Plan' : 'Save Idea to Plan'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ask the AI Event Planner Assistant */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-950 to-purple-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-700/60 text-purple-200">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold">Ask EventEase AI Planner</h3>
          </div>
          <p className="text-xs text-purple-200/90">
            Have a specific logistical challenge, dietary dilemma, or budget question? Get instant expert advice grounded in your event details.
          </p>

          {/* Quick Questions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuestion(q);
                  handleAskAdvice(q);
                }}
                className="text-[11px] bg-white/10 hover:bg-white/20 text-purple-100 px-3 py-1 rounded-full backdrop-blur-xs transition cursor-pointer"
              >
                "{q}"
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="e.g. How do I entertain 15 young kids during the wedding toasts?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAdvice()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={() => handleAskAdvice()}
              disabled={isAskingAdvice || !question.trim()}
              className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isAskingAdvice ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Ask</span>
            </button>
          </div>

          {/* Response Box */}
          {adviceResponse && (
            <div className="p-5 rounded-2xl bg-white/10 border border-white/15 text-xs sm:text-sm text-purple-100 leading-relaxed whitespace-pre-wrap animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-white mb-2">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span>Planner Recommendation:</span>
              </div>
              {adviceResponse}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
