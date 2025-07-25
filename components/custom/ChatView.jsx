"use client";
import { MessagesContext } from '@/context/MessagesContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import Colors from '@/data/Colors';
import Prompt from '@/data/Prompt';
import axios from 'axios';
import { useConvex, useMutation } from 'convex/react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useContext, useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import TypingText from './TypingText';

export const countToken = (inputText) => {
  return inputText.trim().split(/\s+/).filter(word => word).length;
};

function ChatView() {
  const { id } = useParams();
  const convex = useConvex();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const { messages, setMessages } = useContext(MessagesContext);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const UpdateMessages = useMutation(api.workspace.UpdateMessages);
  const UpdateToken = useMutation(api.users.UpdateToken);
  const textareaRef = useRef(null);

  useEffect(() => {
    id && GetWorkspaceData();
  }, [id]);

  const GetWorkspaceData = async () => {
    const result = await convex.query(api.workspace.GetWorkspace, {
      workspaceId: id
    });
    setMessages(result?.messages || []);
  };

  useEffect(() => {
    if (messages?.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        GetAiResponse();
      }
    }
  }, [messages]);

  const GetAiResponse = async () => {
    setLoading(true);
    try {
      const result = await axios.post('/api/ai-chat', {
        prompt: `${Prompt.CHAT_PROMPT}\n\n${messages.map(m => `${m.role}: ${m.content}`).join("\n")}`,
      });

      let aiContent = result.data.result?.text || '[Empty response]';

      try {
        const parsed = JSON.parse(aiContent);

        if (Array.isArray(parsed)) {
          aiContent = parsed[0]?.response || parsed[0]?.text || aiContent;
        } else if (parsed.response) {
          aiContent = parsed.response;
        } else if (parsed.text) {
          aiContent = parsed.text;
        }
      } catch (err) {
        console.log('Non-JSON response, using as plain text');
      }

      const aiResp = { role: 'ai', content: aiContent };
      setMessages(prev => [...prev, aiResp]);

      await UpdateMessages({
        messages: [...messages, aiResp],
        workspaceId: id
      });

      const currentToken = Number(userDetail?.token);
      const used = countToken(JSON.stringify(aiResp));
      const newToken = Math.max(isNaN(currentToken) ? 50000 : currentToken - used, 0);

      if (userDetail?._id) {
        await UpdateToken({ userId: userDetail._id, token: newToken });
        setUserDetail(prev => ({ ...prev, token: newToken }));
      }

    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setLoading(false);
      setAiTyping(false);
    }
  };

  const onGenerate = (input) => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setUserInput('');
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  return (
    <div className="relative h-[85vh] flex flex-col">
      <div className="flex-1 overflow-y-scroll px-4 py-2 scrollbar-hide space-y-4">
        {Array.isArray(messages) && messages.map((msg, index) => (
          <div key={index} className="bg-[#121212] p-4 rounded-xl shadow border border-neutral-800 flex gap-3 items-start">
            {msg.role === 'user' && (
              <Image
                src={userDetail?.picture || "/placeholder.png"}
                alt="user"
                width={35}
                height={35}
                className="rounded-full"
              />
            )}
            <div className="flex-1 text-sm text-white whitespace-pre-wrap leading-relaxed">
              {msg.role === 'ai' ? (
                <TypingText text={typeof msg.content === 'string' ? msg.content : msg.content?.text || '[Empty response]'} />
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {aiTyping && (
          <div className="p-4 rounded-xl flex items-center gap-2 bg-[#121212] border border-neutral-800">
            <span className="text-sm text-white font-mono">Beem is typing</span>
            <div className="dot-typing">
              <span className="text-white">.</span>
              <span className="text-white">.</span>
              <span className="text-white">.</span>
            </div>
          </div>
        )} 

      </div>

      <div className="w-full max-w-3xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-[#121212] rounded-3xl shadow-inner px-4 py-3 w-full border border-neutral-700">
          <textarea
            ref={textareaRef}
            placeholder="Ask Beem your AI engineer..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-white placeholder:text-gray-400 min-h-[40px] max-h-[150px]"
          />
          <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">
            {userInput && (
              <ArrowRight
                onClick={() => onGenerate(userInput)}
                className="h-8 w-8 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 text-white"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatView;
