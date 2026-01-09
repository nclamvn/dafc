'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  User,
  Loader2,
  Mic,
  MicOff,
  Maximize2,
  Bot,
  StopCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAIAssistantChat, SUGGESTION_CHIPS } from '@/lib/ai/hooks';
import { useVoiceInput, VOICE_LANGUAGES } from '@/lib/ai/hooks/use-voice-input';

// Helper to extract text content from message (supports both custom and AI SDK formats)
function getMessageContent(message: { content?: string; parts?: Array<{ type: string; text?: string }> }): string {
  // First check for direct content property (our custom format)
  if (typeof message.content === 'string') {
    return message.content;
  }
  // Fall back to AI SDK v6 parts format
  if (!message.parts) return '';
  return message.parts
    .filter((part) => part.type === 'text' && part.text)
    .map((part) => part.text)
    .join('');
}

interface AIChatWidgetProps {
  context?: {
    page?: string;
    entityType?: string;
    entityId?: string;
    additionalContext?: Record<string, unknown>;
  };
  defaultLanguage?: 'en' | 'vi';
}

export function AIChatWidget({
  context: _context,
  defaultLanguage = 'en',
}: AIChatWidgetProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'vi'>(defaultLanguage);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Memoize callbacks to prevent infinite re-renders
  const handleChatError = useCallback((error: Error) => {
    console.error('Chat error:', error);
  }, []);

  const {
    messages,
    input,
    isLoading,
    isThinking,
    toolCalls,
    setInput,
    handleInputChange,
    handleSubmit,
    sendMessage,
    stop,
  } = useAIAssistantChat({
    language,
    onError: handleChatError,
  });

  // Memoize voice input callback
  const handleVoiceResult = useCallback((text: string) => {
    setInput(text);
  }, [setInput]);

  // Voice input hook - simplified to avoid infinite loops
  const {
    isListening,
    isSupported: voiceSupported,
    transcript,
    startListening,
    stopListening,
  } = useVoiceInput({
    language: VOICE_LANGUAGES[language],
    onResult: handleVoiceResult,
  });

  // Update input with interim transcript while speaking
  useEffect(() => {
    if (transcript && isListening) {
      setInput(transcript);
    }
  }, [transcript, isListening, setInput]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle quick suggestion click
  const handleSuggestionClick = (query: string) => {
    sendMessage(query);
  };

  // Hide widget on AI Assistant page (full page chat already available)
  if (pathname === '/ai-assistant') {
    return null;
  }

  const suggestions = SUGGESTION_CHIPS[language].slice(0, 3);

  return (
    <TooltipProvider>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-10 w-10 rounded-full shadow-lg"
              size="icon"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] bg-background border rounded-lg shadow-xl flex flex-col z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    {language === 'vi' ? 'Trợ lý AI' : 'AI Assistant'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isThinking
                      ? language === 'vi'
                        ? 'Đang suy nghĩ...'
                        : 'Thinking...'
                      : language === 'vi'
                        ? 'Sẵn sàng hỗ trợ'
                        : 'Ready to help'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Language Toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setLanguage(language === 'en' ? 'vi' : 'en')
                      }
                    >
                      <span className="text-xs font-medium">
                        {language.toUpperCase()}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                  </TooltipContent>
                </Tooltip>

                {/* Full Page Link */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <Link href="/ai-assistant">
                        <Maximize2 className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {language === 'vi' ? 'Mở trang đầy đủ' : 'Open full page'}
                  </TooltipContent>
                </Tooltip>

                {/* Close */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {language === 'vi'
                        ? 'Xin chào! Tôi có thể giúp gì cho bạn?'
                        : 'Hello! How can I help you today?'}
                    </p>
                    {/* Quick Suggestions */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleSuggestionClick(suggestion.query)}
                        >
                          {suggestion.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex gap-2',
                          message.role === 'user' && 'flex-row-reverse'
                        )}
                      >
                        <div
                          className={cn(
                            'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
                            message.role === 'assistant'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          {message.role === 'assistant' ? (
                            <Bot className="h-3.5 w-3.5" />
                          ) : (
                            <User className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div
                          className={cn(
                            'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                            message.role === 'assistant'
                              ? 'bg-muted'
                              : 'bg-primary text-primary-foreground'
                          )}
                        >
                          {message.role === 'assistant' ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {getMessageContent(message)}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{getMessageContent(message)}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {/* Tool Calls Indicator */}
                    {toolCalls.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-wrap gap-1 justify-center"
                      >
                        {toolCalls.map((tool) => (
                          <Badge
                            key={tool.id}
                            variant="outline"
                            className="text-xs gap-1"
                          >
                            {tool.name.replace('_', ' ')}
                            {tool.status === 'executing' && (
                              <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            )}
                          </Badge>
                        ))}
                      </motion.div>
                    )}

                    {/* Thinking Indicator */}
                    {isThinking && !toolCalls.length && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2"
                      >
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                        <div className="bg-muted rounded-lg px-3 py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Voice Recording Indicator */}
            {isListening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 py-2 bg-red-500/10 border-t border-red-500/20"
              >
                <div className="flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  {language === 'vi' ? 'Đang ghi âm...' : 'Recording...'}
                </div>
              </motion.div>
            )}

            {/* Input */}
            <div className="p-3 border-t">
              <form onSubmit={handleSubmit} className="flex gap-2">
                {/* Voice Input */}
                {voiceSupported && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant={isListening ? 'destructive' : 'outline'}
                        size="icon"
                        className="shrink-0"
                        onClick={isListening ? stopListening : startListening}
                      >
                        {isListening ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isListening
                        ? language === 'vi'
                          ? 'Dừng ghi âm'
                          : 'Stop'
                        : language === 'vi'
                          ? 'Giọng nói'
                          : 'Voice'}
                    </TooltipContent>
                  </Tooltip>
                )}

                <Input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder={
                    language === 'vi'
                      ? 'Nhập tin nhắn...'
                      : 'Type a message...'
                  }
                  disabled={isLoading}
                  className="flex-1"
                />

                {isLoading ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={stop}
                  >
                    <StopCircle className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="icon"
                    className="shrink-0"
                    disabled={!input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
