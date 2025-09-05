import React, { useState } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';

/**
 * A simple chat panel using React.
 */
export class ChatPanel extends ReactWidget {
  constructor() {
    super();
    this.addClass('jp-EDAAgentChatPanel');
  }

  protected render(): JSX.Element {
    return <ChatComponent />;
  }
}

const ChatComponent = (): JSX.Element => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleSend = (): void => {
    if (!input.trim()) {
      return;
    }
    setMessages([...messages, input]);
    setInput('');
  };

  return (
    <div className="jp-EDAAgentChatContainer">
      <div className="jp-EDAAgentChatMessages">
        {messages.map((m, i) => (
          <div key={i} className="jp-EDAAgentChatMessage">
            {m}
          </div>
        ))}
      </div>
      <div className="jp-EDAAgentChatInput">
        <input
          className="jp-EDAAgentInputField"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
        />
        <button className="jp-EDAAgentSendButton" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
