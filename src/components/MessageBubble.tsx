import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: string;
  isBot?: boolean;
  timestamp?: string;
  status?: "sent" | "delivered" | "read";
}

const MessageBubble = ({
  message = "Hello, how can I help you with the Building Safety Act today?",
  isBot = true,
  timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
  status = "delivered",
}: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        "flex w-full max-w-[800px] gap-3 mb-4",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {/* Bot Avatar */}
      {isBot && (
        <div className="flex-shrink-0 mt-1" aria-label="Bot Avatar">
          <Avatar>
            <AvatarImage src="/vite.svg" alt="Bot Avatar Image" />
            <AvatarFallback className="bg-blue-600 text-white">BSA</AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Message Box */}
      <div
        className={cn(
          "rounded-lg px-4 py-3 max-w-[80%] relative prose prose-sm prose-invert break-words",
          isBot
            ? "bg-slate-700/50 text-slate-200 border border-slate-600/50"
            : "bg-blue-600 text-white"
        )}
      >
        <ReactMarkdown>{message}</ReactMarkdown>

        <div
          className={cn(
            "text-xs mt-1 flex items-center",
            isBot ? "text-slate-400" : "text-blue-100"
          )}
        >
          <span>{timestamp}</span>

          {!isBot && (
            <span className="ml-2">
              {status === "sent" && "✓"}
              {status === "delivered" && "✓✓"}
              {status === "read" && <span className="text-blue-300">✓✓</span>}
            </span>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {!isBot && (
        <div className="flex-shrink-0 mt-1" aria-label="User Avatar">
          <Avatar>
            <AvatarImage
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
              alt="User Avatar Image"
            />
            <AvatarFallback className="bg-slate-600 text-white">You</AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
