import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { Property } from '../../types';
import {
  Sparkles,
  X,
  Send,
  Building,
  ArrowRight,
  Bot,
  User as UserIcon,
  Loader2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Minimize2,
  Minus,
  RotateCcw,
  Compass,
  DollarSign,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProperty?: (property: Property) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendedProperties?: Property[];
  timestamp: string;
}

type SuggestionCategory = 'all' | 'budget' | 'location' | 'properties';

interface QuickPrompt {
  label: string;
  query: string;
  category: 'budget' | 'location' | 'properties';
}

const QUICK_PROMPTS: QuickPrompt[] = [
  // Budget
  {
    label: 'Under ₦500M',
    query: 'What properties are available under ₦500 Million in Lagos?',
    category: 'budget',
  },
  {
    label: '₦300M Budget',
    query: 'What can I get with a budget of ₦300M in Lekki or Ikeja GRA?',
    category: 'budget',
  },
  {
    label: '₦1B+ Luxury',
    query: 'Show me ultra-luxury estates and villas above ₦1 Billion.',
    category: 'budget',
  },
  {
    label: 'Rentals < ₦50M',
    query: 'What are the best executive rentals under ₦50M/year?',
    category: 'budget',
  },

  // Location
  {
    label: 'Banana Island',
    query: 'Tell me about available waterfront villas in Banana Island, Ikoyi.',
    category: 'location',
  },
  {
    label: 'Lekki Phase 1',
    query: 'Show contemporary smart homes in Lekki Phase 1 and their rental yields.',
    category: 'location',
  },
  {
    label: 'Maitama & Guzape',
    query: 'What diplomatic mansions are available in Maitama and Guzape, Abuja?',
    category: 'location',
  },
  {
    label: 'Victoria Island / Eko Atlantic',
    query: 'Oceanfront penthouses in Victoria Island or Eko Atlantic City.',
    category: 'location',
  },
  {
    label: 'Ikeja GRA / Mainland',
    query: 'Executive residences near the airport in Ikeja GRA.',
    category: 'location',
  },

  // Properties & Amenities
  {
    label: 'Pool & Cinema',
    query: 'Show me properties with private swimming pool and private cinema.',
    category: 'properties',
  },
  {
    label: 'Waterfront & Jetty',
    query: 'Villas with direct water view and private boat jetty.',
    category: 'properties',
  },
  {
    label: "Governor's Consent",
    query: "Explain Governor's Consent titles and which listings have verified titles.",
    category: 'properties',
  },
];

// Helper to render bold markdown and bullet items nicely
function FormattedMessageText({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Render bold text parts
        const renderFormattedLine = (str: string) => {
          const parts = str.split(/(\*\*[^*]+\*\*)/g);
          return parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="text-amber-300 font-semibold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });
        };

        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1.5">
              <span className="text-amber-400 font-bold shrink-0">•</span>
              <span>{renderFormattedLine(trimmed.substring(1).trim())}</span>
            </div>
          );
        }

        if (/^\d+\./.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s*(.*)$/);
          if (match) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 mt-1 font-medium">
                <span className="text-amber-400 font-bold shrink-0">{match[1]}</span>
                <span>{renderFormattedLine(match[2])}</span>
              </div>
            );
          }
        }

        return <p key={idx}>{renderFormattedLine(trimmed)}</p>;
      })}
    </div>
  );
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Welcome to PrimeNest AI! I am your luxury real estate advisor for KunlexCity. I am directly connected to our live verified portfolio in Lagos (Banana Island, Ikoyi, Lekki Phase 1, Victoria Island, Ikeja GRA), Abuja (Maitama, Guzape), and Port Harcourt.\n\nAsk me anything about properties, budget feasibility, or prime locations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SuggestionCategory>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, loading]);

  if (!isOpen) return null;

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'ai',
        text: 'Conversation reset. How can I assist your real estate search today? Feel free to ask about any location, budget bracket, or property specification.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      // Build history
      const history = messages.slice(-5).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: m.text,
      }));

      const res = await api.gemini.chat(textToSend, history);
      if (res.success && res.data) {
        const aiMsg: Message = {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: res.data.reply,
          recommendedProperties: res.data.recommendedProperties,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('No reply from server');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'ai',
          text: 'I am currently synchronizing with our database server. You can also browse our live verified listings across Lagos, Abuja, and Port Harcourt directly in the Properties directory.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrompts =
    activeCategory === 'all'
      ? QUICK_PROMPTS
      : QUICK_PROMPTS.filter((p) => p.category === activeCategory);

  if (isMinimized) {
    return (
      <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 bg-slate-900 border border-amber-500/50 rounded-2xl shadow-2xl p-2.5 px-3.5 flex items-center gap-3 text-white cursor-pointer hover:border-amber-400 transition-all animate-in fade-in">
        <div className="flex items-center gap-2" onClick={() => setIsMinimized(false)}>
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white font-serif-luxury">PrimeNest AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            </div>
            <p className="text-[10px] text-amber-300">Tap to expand advisor</p>
          </div>
        </div>
        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 hover:text-amber-400 text-slate-400 rounded transition-colors cursor-pointer"
            title="Expand"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:text-white text-slate-400 rounded transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 flex flex-col bg-slate-900/98 backdrop-blur-md border border-amber-500/40 rounded-2xl shadow-2xl text-white overflow-hidden animate-in fade-in slide-in-from-bottom-3 ${
        isMaximized
          ? 'inset-2 sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[580px] sm:h-[760px] sm:max-h-[90vh] h-[calc(100dvh-1rem)]'
          : 'bottom-2 inset-x-2 sm:inset-x-auto sm:right-6 sm:bottom-6 w-auto sm:w-[420px] h-[520px] max-h-[85dvh]'
      }`}
    >
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-sm shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-xs font-serif-luxury tracking-wide">
                PrimeNest AI Advisor
              </h3>
              <span className="text-[9px] bg-amber-400/20 text-amber-300 font-semibold px-1.5 py-0.5 rounded-full border border-amber-400/30">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
              <span>Live Database • Properties, Budget & Locations</span>
            </p>
          </div>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={handleClearChat}
            className="p-1.5 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMaximized((prev) => !prev)}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={isMaximized ? 'Restore View' : 'Maximize View'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category selector row */}
      <div className="px-3 py-1.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] shrink-0">
        <span className="text-slate-400 text-[10px] font-medium shrink-0 flex items-center gap-1 mr-1">
          <Compass className="w-3 h-3 text-amber-400" /> Focus:
        </span>
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-2 py-0.5 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'all'
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
              : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:text-white'
          }`}
        >
          All Topics
        </button>
        <button
          onClick={() => setActiveCategory('budget')}
          className={`px-2 py-0.5 rounded-full border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
            activeCategory === 'budget'
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
              : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:text-white'
          }`}
        >
          <DollarSign className="w-2.5 h-2.5" /> Budget & Prices
        </button>
        <button
          onClick={() => setActiveCategory('location')}
          className={`px-2 py-0.5 rounded-full border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
            activeCategory === 'location'
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
              : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:text-white'
          }`}
        >
          <MapPin className="w-2.5 h-2.5" /> Locations & Enclaves
        </button>
        <button
          onClick={() => setActiveCategory('properties')}
          className={`px-2 py-0.5 rounded-full border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
            activeCategory === 'properties'
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
              : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:text-white'
          }`}
        >
          <Home className="w-2.5 h-2.5" /> Properties & Specs
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-amber-400" />
              </div>
            )}

            <div
              className={`max-w-[88%] sm:max-w-[82%] rounded-xl px-3.5 py-2.5 text-xs shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none'
              }`}
            >
              {msg.sender === 'ai' ? (
                <FormattedMessageText content={msg.text} />
              ) : (
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
              )}

              {/* If AI recommended properties */}
              {msg.recommendedProperties && msg.recommendedProperties.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Live Verified Matches:
                    </p>
                    <span className="text-[9px] text-slate-400">
                      {msg.recommendedProperties.length} listing{msg.recommendedProperties.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {msg.recommendedProperties.map((prop) => (
                      <div
                        key={prop.id}
                        className="bg-slate-900/95 rounded-xl p-2.5 border border-slate-700 hover:border-amber-400/80 transition-all flex flex-col sm:flex-row gap-2.5 group"
                      >
                        <img
                          src={prop.images[0]}
                          alt={prop.title}
                          className="w-full sm:w-16 h-24 sm:h-16 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="font-bold text-[11px] text-white truncate group-hover:text-amber-400">
                                {prop.title}
                              </h5>
                              <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 shrink-0">
                                {prop.listingType}
                              </span>
                            </div>

                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                              <span>{prop.area}, {prop.city}</span>
                            </div>

                            <div className="flex items-center gap-3 text-[10px] text-slate-300 mt-1">
                              <span className="flex items-center gap-0.5">
                                <Bed className="w-2.5 h-2.5 text-amber-400" /> {prop.bedrooms} Beds
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Bath className="w-2.5 h-2.5 text-amber-400" /> {prop.bathrooms} Baths
                              </span>
                              <span>{prop.propertySize} sqm</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800">
                            <span className="text-xs font-bold text-amber-400 font-mono">
                              {prop.price >= 1000000000
                                ? `₦${(prop.price / 1000000000).toFixed(2)}B`
                                : `₦${(prop.price / 1000000).toFixed(0)}M`}
                              {prop.listingType === 'RENT' && (
                                <span className="text-[9px] text-slate-400 font-normal">/yr</span>
                              )}
                            </span>
                            <Link
                              to={`/properties/${prop.id}`}
                              onClick={onClose}
                              className="text-[10px] text-slate-900 bg-amber-400 hover:bg-amber-300 font-bold px-2 py-0.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Property</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`text-[9px] mt-1.5 ${
                  msg.sender === 'user' ? 'text-slate-900/70 text-right' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-8 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Consulting live inventory & neural real estate engine...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Pills */}
      <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-950/60 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
          {filteredPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.query)}
              className="shrink-0 bg-slate-800/90 hover:bg-amber-500/20 hover:border-amber-400/60 text-slate-300 hover:text-amber-300 px-2.5 py-1 rounded-full border border-slate-700/70 transition-all whitespace-nowrap cursor-pointer text-[10px] flex items-center gap-1"
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar */}
      <div className="p-2.5 sm:p-3 border-t border-slate-800 bg-slate-950 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about properties, budget (e.g. ₦400M), or locations..."
            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1"
            title="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Send</span>
          </button>
        </form>
        <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1.5 px-0.5">
          <span>Grounded on KunlexCity PrimeNest verified inventory</span>
          <span className="text-amber-400/80 font-mono">Lagos • Abuja • Port Harcourt</span>
        </div>
      </div>
    </div>
  );
};
