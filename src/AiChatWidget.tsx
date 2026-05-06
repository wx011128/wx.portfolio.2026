import { ArrowUp, Loader2 } from 'lucide-react';
import type { CSSProperties, FormEvent, PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

type ChatRole = 'assistant' | 'user';

type ChatMessage = {
  content: string;
  id: string;
  role: ChatRole;
};

type DragPosition = {
  x: number;
  y: number;
};

type ElementSize = {
  height: number;
  width: number;
};

type PanelLayout = {
  bottom: string;
  maxHeight: number;
  top: string;
  x: number;
};

type DragState = {
  hasMoved: boolean;
  originX: number;
  originY: number;
  pointerId: number;
  startX: number;
  startY: number;
};

const assistantDesktopSize = {
  height: 94,
  width: 78,
};

const assistantMobileSize = {
  height: 82,
  width: 68,
};

const dragMargin = 12;
const dragThreshold = 4;
const assistantDesktopInitialBottomGap = 150;
const assistantDesktopInitialRightGap = 30;
const assistantMobileInitialTopRatio = 0.365;
const assistantMobileInitialRightGapRatio = 0.105;
const assistantInitialRightGapMin = 44;
const panelDesktopMaxSize = {
  height: 580,
  width: 380,
};
const panelMobileMaxSize = {
  height: 520,
  width: Number.POSITIVE_INFINITY,
};
const panelDesktopViewportInset = 16;
const panelMobileViewportInset = 14;
const panelDesktopHeightReserve = 118;
const panelMobileHeightReserve = 92;
const panelGap = 12;
const panelMinimumAvailableHeight = 120;

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: '你好，我是危箫的AI助手，你可以问我任何关于这个作品集的问题。',
  },
];

const defaultQuestions = [
  '你擅长什么？',
  '作品集中包含什么项目？',
  '你有什么实习经历？',
  '你会哪些工具和 AI 技能？',
  '怎么联系你？',
];

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    content,
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
  };
}

function getReadableError(status: number) {
  if (status === 501) {
    return 'AI 接口还没有配置 API Key。请在部署环境里设置 OPENAI_API_KEY 后再试。';
  }

  if (status === 429) {
    return '现在请求有点多，请稍后再问一次。';
  }

  return '我这边暂时没有连上 AI 服务，请稍后再试。';
}

function getAssistantSize() {
  return window.matchMedia('(max-width: 720px)').matches ? assistantMobileSize : assistantDesktopSize;
}

function getIsMobileViewport() {
  return window.matchMedia('(max-width: 720px)').matches;
}

function clampNumber(value: number, min: number, max: number) {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(min, value), max);
}

function clampAssistantPosition(position: DragPosition): DragPosition {
  const size = getAssistantSize();

  return {
    x: clampNumber(position.x, dragMargin, window.innerWidth - size.width - dragMargin),
    y: clampNumber(position.y, dragMargin, window.innerHeight - size.height - dragMargin),
  };
}

function getPanelSize(): ElementSize {
  const isMobile = getIsMobileViewport();
  const viewportInset = isMobile ? panelMobileViewportInset : panelDesktopViewportInset;
  const maxSize = isMobile ? panelMobileMaxSize : panelDesktopMaxSize;
  const heightReserve = isMobile ? panelMobileHeightReserve : panelDesktopHeightReserve;

  return {
    height: Math.max(220, Math.min(maxSize.height, window.innerHeight - heightReserve)),
    width: isMobile ? window.innerWidth - viewportInset * 2 : Math.min(maxSize.width, window.innerWidth - viewportInset * 2),
  };
}

function getPanelLayout(assistantPosition: DragPosition): PanelLayout {
  const assistantSize = getAssistantSize();
  const panelSize = getPanelSize();
  const isMobile = getIsMobileViewport();
  const viewportInset = isMobile ? panelMobileViewportInset : panelDesktopViewportInset;
  const maxX = window.innerWidth - panelSize.width - viewportInset;
  const assistantCenterX = assistantPosition.x + assistantSize.width / 2;
  const rightAlignedX = assistantPosition.x + assistantSize.width - panelSize.width;
  const preferredX = assistantCenterX > window.innerWidth / 2 ? rightAlignedX : assistantPosition.x;
  const belowTop = assistantPosition.y + assistantSize.height + panelGap;
  const aboveAvailableHeight = assistantPosition.y - viewportInset - panelGap;
  const belowAvailableHeight = window.innerHeight - belowTop - viewportInset;
  const shouldOpenAbove = aboveAvailableHeight > belowAvailableHeight;
  const maxHeight = Math.max(
    panelMinimumAvailableHeight,
    shouldOpenAbove ? aboveAvailableHeight : belowAvailableHeight,
  );
  const top = shouldOpenAbove ? 'auto' : `${belowTop}px`;
  const bottom = shouldOpenAbove ? `${window.innerHeight - assistantPosition.y + panelGap}px` : 'auto';

  return {
    x: clampNumber(preferredX, viewportInset, maxX),
    top,
    bottom,
    maxHeight,
  };
}

function snapAssistantPosition(position: DragPosition): DragPosition {
  const size = getAssistantSize();
  const clampedPosition = clampAssistantPosition(position);
  const leftDistance = clampedPosition.x;
  const rightDistance = window.innerWidth - size.width - clampedPosition.x;

  return {
    x: leftDistance <= rightDistance ? dragMargin : window.innerWidth - size.width - dragMargin,
    y: clampedPosition.y,
  };
}

function getInitialAssistantPosition(): DragPosition {
  const size = getAssistantSize();
  const isMobile = getIsMobileViewport();

  if (!isMobile) {
    return clampAssistantPosition({
      x: window.innerWidth - size.width - assistantDesktopInitialRightGap,
      y: window.innerHeight - size.height - assistantDesktopInitialBottomGap,
    });
  }

  const rightGap = Math.max(assistantInitialRightGapMin, window.innerWidth * assistantMobileInitialRightGapRatio);

  return clampAssistantPosition({
    x: window.innerWidth - size.width - rightGap,
    y: window.innerHeight * assistantMobileInitialTopRatio,
  });
}

function getFollowUpQuestions(answer: string) {
  if (answer.includes('我没有理解你的问题')) {
    return defaultQuestions;
  }

  if (answer.includes('我主要擅长用户研究需求分析')) {
    return [
      '你会哪些工具和 AI 技能？',
      '作品集中包含什么项目？',
      '你的设计理念是什么？',
    ];
  }

  if (answer.includes('我的松屋银座用户体验设计项目')) {
    return [
      '你在松屋银座项目负责什么？',
      '松屋银座项目有什么成果？',
      '介绍一下悦享智行项目',
    ];
  }

  if (answer.includes('在松屋银座项目中，我主要负责')) {
    return [
      '松屋银座项目有什么成果？',
      '作品集中包含什么项目？',
      '介绍一下悦享智行项目',
    ];
  }

  if (answer.includes('松屋银座项目进入了')) {
    return [
      '你在松屋银座项目负责什么？',
      '日本作品集是什么？',
      '你会哪些工具和 AI 技能？',
    ];
  }

  if (answer.includes('我的悦享智行多平台体验设计')) {
    return [
      '你在悦享智行项目里负责什么？',
      '介绍一下松屋银座项目',
      '日本作品集是什么？',
    ];
  }

  if (answer.includes('在悦享智行项目中，我作为人机交互设计实习生')) {
    return [
      '介绍一下悦享智行项目',
      '作品集中包含什么项目？',
      '你会哪些工具和 AI 技能？',
    ];
  }

  if (answer.includes('我曾在东风汽车悦享交通部门')) {
    return [
      '介绍一下悦享智行项目',
      '介绍一下松屋银座项目',
      '你擅长什么？',
    ];
  }

  if (answer.includes('我的作品集目前主要包含')) {
    return [
      '介绍一下松屋银座项目',
      '介绍一下悦享智行项目',
      '日本作品集是什么？',
    ];
  }

  if (answer.includes('我的交互艺术装置日本方向作品集')) {
    return [
      '交互艺术装置作品集你负责什么？',
      '介绍一下松屋银座项目',
      '你会哪些工具和 AI 技能？',
    ];
  }

  if (answer.includes('日本方向作品集里的三个作品')) {
    return [
      '日本作品集是什么？',
      '作品集中包含什么项目？',
      '你的设计理念是什么？',
    ];
  }

  if (answer.includes('我常用的工具包括')) {
    return [
      '你为什么学习 AI？',
      '你擅长什么？',
      '作品集中包含什么项目？',
    ];
  }

  if (answer.includes('我学习 AI 是因为')) {
    return [
      '你会哪些工具和 AI 技能？',
      '你擅长什么？',
      '介绍一下松屋银座项目',
    ];
  }

  if (answer.includes('我的设计理念是')) {
    return [
      '你擅长什么？',
      '你为什么学习 AI？',
      '介绍一下松屋银座项目',
    ];
  }

  if (answer.includes('你可以通过电话')) {
    return [
      '你擅长什么？',
      '作品集中包含什么项目？',
      '你有什么实习经历？',
    ];
  }

  return defaultQuestions;
}

function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<DragPosition | null>(null);
  const [promptQuestions, setPromptQuestions] = useState(defaultQuestions);
  const abortRef = useRef<AbortController | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const skipClickRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      messagesRef.current?.scrollTo({
        behavior: 'smooth',
        top: messagesRef.current.scrollHeight,
      });
    }
  }, [isOpen, messages]);

  useEffect(() => {
    const updatePosition = () => {
      setPosition((currentPosition) =>
        clampAssistantPosition(currentPosition ?? getInitialAssistantPosition()),
      );
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  const sendMessage = async (text: string) => {
    const trimmedText = text.trim();

    if (!trimmedText || isSending) {
      return;
    }

    const userMessage = createMessage('user', trimmedText);
    const assistantMessage = createMessage('assistant', '');
    const nextMessages = [...messages, userMessage, assistantMessage];

    setMessages(nextMessages);
    setInput('');
    setPromptQuestions([]);
    setIsSending(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        body: JSON.stringify({
          messages: [...messages, userMessage].slice(-8).map(({ role, content }) => ({ role, content })),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(getReadableError(response.status));
      }

      if (!response.body) {
        throw new Error('浏览器暂时不支持流式回答。');
      }

      const decoder = new TextDecoder();
      const reader = response.body.getReader();
      let answer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        answer += decoder.decode(value, { stream: true });
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessage.id ? { ...message, content: answer } : message,
          ),
        );
      }

      if (!answer.trim()) {
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessage.id ? { ...message, content: '我暂时没有生成回答，请再问一次。' } : message,
          ),
        );
        setPromptQuestions(defaultQuestions);
      } else {
        setPromptQuestions(getFollowUpQuestions(answer));
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      const fallback = error instanceof Error ? error.message : '我这边暂时没有连上 AI 服务，请稍后再试。';
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === assistantMessage.id ? { ...message, content: fallback } : message,
        ),
      );
      setPromptQuestions(defaultQuestions);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }

      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleTogglePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!position) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    dragStateRef.current = {
      hasMoved: false,
      originX: position.x,
      originY: position.y,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
  };

  const handleTogglePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (!dragState.hasMoved && Math.hypot(deltaX, deltaY) < dragThreshold) {
      return;
    }

    dragState.hasMoved = true;
    skipClickRef.current = true;
    setPosition(
      clampAssistantPosition({
        x: dragState.originX + deltaX,
        y: dragState.originY + deltaY,
      }),
    );
  };

  const handleTogglePointerEnd = (event: PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;

    if (dragState?.pointerId !== event.pointerId) {
      return;
    }

    skipClickRef.current = dragState.hasMoved;
    setIsDragging(false);

    if (dragState.hasMoved) {
      setPosition((currentPosition) => snapAssistantPosition(currentPosition ?? getInitialAssistantPosition()));
    }

    dragStateRef.current = null;
  };

  const toggleOpen = () => {
    if (skipClickRef.current) {
      skipClickRef.current = false;
      return;
    }

    setIsOpen((current) => !current);
  };

  const chatStyle = position
    ? (() => {
        const panelLayout = getPanelLayout(position);

        return {
          '--ai-chat-x': `${position.x}px`,
          '--ai-chat-y': `${position.y}px`,
          '--ai-panel-bottom': panelLayout.bottom,
          '--ai-panel-max-height': `${panelLayout.maxHeight}px`,
          '--ai-panel-top': panelLayout.top,
          '--ai-panel-x': `${panelLayout.x}px`,
        } as CSSProperties;
      })()
    : undefined;
  const isNearLeftEdge = position ? position.x < window.innerWidth / 2 : false;

  return (
    <aside
      className={`ai-chat ${isOpen ? 'is-open' : ''} ${isDragging ? 'is-dragging' : ''} ${isNearLeftEdge ? 'is-left-side' : ''}`}
      aria-label="危箫的数字分身"
      style={chatStyle}
    >
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? '关闭 AI 助手' : '打开 AI 助手'}
        className="ai-chat-toggle"
        onClick={toggleOpen}
        onPointerCancel={handleTogglePointerEnd}
        onPointerDown={handleTogglePointerDown}
        onPointerMove={handleTogglePointerMove}
        onPointerUp={handleTogglePointerEnd}
        onLostPointerCapture={handleTogglePointerEnd}
        type="button"
      >
        <img src="/assets/ai-assistant/assistant-character.png" alt="" />
      </button>

      <section className="ai-chat-panel" aria-hidden={!isOpen}>
        <header className="ai-chat-header">
          <span className="ai-chat-mark">
            <img src="/assets/ai-assistant/assistant-character.png" alt="" />
          </span>
          <div>
            <h2>AI助手</h2>
          </div>
        </header>

        <div className="ai-chat-messages" ref={messagesRef} role="log" aria-live="polite" aria-relevant="additions text">
          {messages.map((message) => (
            <article className={`ai-chat-message ${message.role}`} key={message.id}>
              {message.content || (
                <span className="ai-chat-thinking">
                  <Loader2 aria-hidden="true" />
                  思考中
                </span>
              )}
            </article>
          ))}
        </div>

        <div className="ai-chat-prompts" aria-label="推荐问题">
          {promptQuestions.map((question) => (
            <button disabled={isSending} key={question} onClick={() => void sendMessage(question)} type="button">
              {question}
            </button>
          ))}
        </div>

        <form className="ai-chat-form" onSubmit={handleSubmit}>
          <input
            aria-label="向 AI 助手提问"
            disabled={isSending}
            onChange={(event) => setInput(event.target.value)}
            placeholder="输入你的问题"
            type="text"
            value={input}
          />
          <button aria-label="发送问题" disabled={isSending || !input.trim()} type="submit">
            <ArrowUp aria-hidden="true" />
          </button>
        </form>
      </section>
    </aside>
  );
}

export default AiChatWidget;
