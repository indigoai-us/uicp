'use client';

import { Message as MessageType } from 'ai';
import ReactMarkdown from 'react-markdown';
import { parseUICPContentSync, hasUICPBlocks } from '@uicp/parser';
import { useEffect, useState } from 'react';
import definitions from '@/lib/uicp/definitions.json';
import { registerComponent } from '@uicp/parser';
import { SimpleCard } from '@/components/uicp/simple-card';
import { DataTable } from '@/components/uicp/data-table';

// Register components on module load
registerComponent('SimpleCard', SimpleCard);
registerComponent('DataTable', DataTable);

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const [parsedContent, setParsedContent] = useState<any[]>([]);
  const isUser = message.role === 'user';

  useEffect(() => {
    if (!isUser && hasUICPBlocks(message.content)) {
      const parsed = parseUICPContentSync(message.content, definitions as any);
      setParsedContent(parsed);
    }
  }, [message.content, isUser]);

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
        ) : hasUICPBlocks(message.content) && parsedContent.length > 0 ? (
          <div>
            {parsedContent.map((item) =>
              item.type === 'component' ? (
                <div key={item.key}>{item.content}</div>
              ) : (
                <div key={item.key} className="prose prose-invert max-w-none">
                  <ReactMarkdown>{item.content as string}</ReactMarkdown>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

