'use client';

import { Message as MessageType } from 'ai';
import ReactMarkdown from 'react-markdown';
import { UICPContent } from '@uicp/parser';
import definitions from '@/lib/uicp/definitions.json';
import '@/lib/uicp/registry'; // Pre-register components

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-100'
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <UICPContent
            content={message.content}
            definitions={definitions as any}
            componentsBasePath="/components/uicp"
            textRenderer={(text) => (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{text}</ReactMarkdown>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}

