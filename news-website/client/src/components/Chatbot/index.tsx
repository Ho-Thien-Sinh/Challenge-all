import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';

// Styled components
const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const ChatbotButton = styled(Button)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #1890ff;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  
  &:hover {
    background-color: #40a9ff;
  }
`;

const ChatWindow = styled.div`
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
`;

const ChatHeader = styled.div`
  background: #1890ff;
  color: white;
  padding: 15px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
`;

const Message = styled.div<{ isuser: boolean }>`
  background: ${props => props.isuser ? '#1890ff' : '#f0f2f5'};
  color: ${props => props.isuser ? 'white' : 'black'};
  border-radius: 18px;
  padding: 10px 15px;
  margin-bottom: 10px;
  max-width: 80%;
  align-self: ${props => props.isuser ? 'flex-end' : 'flex-start'};
  word-wrap: break-word;
`;

const ChatInputContainer = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #f0f0f0;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  outline: none;
  margin-right: 10px;
  
  &:focus {
    border-color: #1890ff;
  }
`;

const SendButton = styled(Button)`
  border-radius: 20px;
`;

interface ChatMessage {
  id: number;
  message: string;
  isUser: boolean;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, message: 'Xin chào! Tôi có thể giúp gì cho bạn?', isUser: false }
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Thêm tin nhắn của người dùng
    const userMessage = { id: Date.now(), message: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    
    // Xử lý tin nhắn và phản hồi
    const botResponse = getBotResponse(input);
    setTimeout(() => {
      setMessages(prev => [...prev, botResponse]);
    }, 500);

    setInput('');
  };

  const getBotResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase();
    let response = '';
    
    if (input.includes('xin chào') || input.includes('hello') || input.includes('hi')) {
      response = 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?';
    } else if (input.includes('tin tức') || input.includes('bài viết')) {
      response = 'Bạn muốn xem tin tức về chủ đề gì? Tôi có thể giúp bạn tìm kiếm tin tức mới nhất.';
    } else if (input.includes('cảm ơn') || input.includes('thanks')) {
      response = 'Không có gì! Nếu bạn cần thêm thông tin, đừng ngần ngại hỏi tôi nhé!';
    } else if (input.includes('tạm biệt') || input.includes('bye')) {
      response = 'Tạm biệt bạn! Hẹn gặp lại!';
    } else {
      response = 'Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể hỏi lại không?';
    }
    
    return {
      id: Date.now() + 1,
      message: response,
      isUser: false
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <ChatbotContainer>
      {isOpen && (
        <ChatWindow>
          <ChatHeader>
            <span>Trợ lý ảo</span>
            <Button 
              type="text" 
              icon={<CloseOutlined style={{ color: 'white' }} />} 
              onClick={() => setIsOpen(false)}
            />
          </ChatHeader>
          <ChatMessages>
            {messages.map((msg) => (
              <Message 
                key={msg.id} 
                isuser={msg.isUser}
                style={{ marginLeft: msg.isUser ? 'auto' : '0' }}
              >
                {msg.message}
              </Message>
            ))}
          </ChatMessages>
          <ChatInputContainer>
            <ChatInput
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
            />
            <SendButton 
              type="primary" 
              onClick={handleSendMessage}
            >
              Gửi
            </SendButton>
          </ChatInputContainer>
        </ChatWindow>
      )}
      <ChatbotButton 
        type="primary" 
        shape="circle" 
        icon={isOpen ? <CloseOutlined /> : <MessageOutlined />} 
        onClick={() => setIsOpen(!isOpen)}
      />
    </ChatbotContainer>
  );
};

export default Chatbot;
