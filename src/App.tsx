import type { FormEvent, KeyboardEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import systemicLogo from './assets/systemicLogo.png'
import sendIcon from './assets/send-icon.png'

type Message = {
  id: string
  author: 'me' | 'them'
  text: string
  time: string
}

type Conversation = {
  id: string
  name: string
  avatar: string
  status: string
  lastMessage: string
  time: string
  unread?: number
  role: string
  location: string
  virtualNumber: string
  messages: Message[]
  topics: string[]
}

const initialConversations: Conversation[] = [
  {
    id: '1',
    name: 'Amina Blake',
    avatar: 'AB',
    status: 'Active now',
    lastMessage: 'Let’s finalise the launch deck tonight.',
    time: '2m',
    unread: 2,
    role: 'Product Lead · Launch Crew',
    virtualNumber: '+1 (415) 555-2044',
    location: 'San Francisco, USA',
    topics: ['Launch', 'Deck review', 'Blocking issues'],
    messages: [
      {
        id: '1',
        author: 'them',
        text: 'Hey! I merged the latest analytics dashboard update.',
        time: '09:18',
      },
      {
        id: '2',
        author: 'me',
        text: 'Great! I’ll plug that into the slides so stakeholders see the new funnel.',
        time: '09:21',
      },
      {
        id: '3',
        author: 'them',
        text: 'Perfect. Can you drop a note on the pricing slide too?',
        time: '09:23',
      },
      {
        id: '4',
        author: 'me',
        text: 'On it. Anything else blocking the launch?',
        time: '09:24',
      },
      {
        id: '5',
        author: 'them',
        text: 'Just QA sign-off on the billing flow. I pinged the team already.',
        time: '09:25',
      },
    ],
  },
  {
    id: '2',
    name: 'Jamal Carter',
    avatar: 'JC',
    status: 'Active 5m ago',
    lastMessage: 'Let me know once the API is patched.',
    time: '12m',
    role: 'Engineering Manager · Core Platform',
    virtualNumber: '+1 (737) 555-8832',
    location: 'Austin, USA',
    topics: ['API upgrade', 'Error handling', 'Rollout plan'],
    messages: [
      {
        id: '1',
        author: 'them',
        text: 'Morning! The client logs are still showing stale tokens.',
        time: '08:32',
      },
      {
        id: '2',
        author: 'me',
        text: 'Got it. I’ll rotate and redeploy in 20 minutes.',
        time: '08:34',
      },
      {
        id: '3',
        author: 'them',
        text: 'Thanks. Ping me if you need a reviewer.',
        time: '08:35',
      },
    ],
  },
  {
    id: '3',
    name: 'Selena Wu',
    avatar: 'SW',
    status: 'Active 2h ago',
    lastMessage: 'Tomorrow’s sync is shifted to 10:00.',
    time: '1h',
    role: 'Design Director · Experience',
    virtualNumber: '+65 6900 1144',
    location: 'Singapore',
    topics: ['Design sync', 'Prototype', 'Feedback'],
    messages: [
      {
        id: '1',
        author: 'them',
        text: 'Sharing the updated prototype in the design channel now.',
        time: '06:52',
      },
      {
        id: '2',
        author: 'me',
        text: 'Looks sharp. I’ll collect feedback before our sync.',
        time: '06:55',
      },
      {
        id: '3',
        author: 'them',
        text: 'Perfect. The motion study is in Figma if you have notes.',
        time: '06:56',
      },
    ],
  },
]

type ActivePanel = 'chats' | 'conversation' | 'details'

function App() {
  const [threads, setThreads] = useState<Conversation[]>(initialConversations)
  const [selectedConversationId, setSelectedConversationId] = useState(initialConversations[0]?.id ?? '')
  const [activePanel, setActivePanel] = useState<ActivePanel>('conversation')
  const [messageDraft, setMessageDraft] = useState('')
  const [callTarget, setCallTarget] = useState<{ label: string; detail?: string; avatar?: string } | null>(
    null,
  )
  const [isDialpadOpen, setIsDialpadOpen] = useState(false)
  const [dialpadNumber, setDialpadNumber] = useState('')
  const conversationBodyRef = useRef<HTMLDivElement>(null)
  const scrollAnchorRef = useRef<HTMLLIElement>(null)

  const selectedConversation = useMemo(() => {
    if (!threads.length) {
      return undefined
    }
    return threads.find((conversation) => conversation.id === selectedConversationId) ?? threads[0]
  }, [selectedConversationId, threads])

  useEffect(() => {
    setMessageDraft('')
  }, [selectedConversationId])

  const messageCount = selectedConversation?.messages.length ?? 0

  useEffect(() => {
    const container = conversationBodyRef.current
    if (!container) {
      return
    }

    const scrollToBottom = () => {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        })
      } else {
        container.scrollTop = container.scrollHeight
      }
    }

    requestAnimationFrame(scrollToBottom)
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messageCount, selectedConversationId])

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
    setActivePanel('conversation')
    setMessageDraft('')
  }

  const handleSendMessage = () => {
    const text = messageDraft.trim()
    if (!text || !selectedConversation) {
      return
    }

    const timestamp = new Date()
    const timeLabel = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const messageId = `${selectedConversation.id}-${timestamp.getTime()}`

    setThreads((prevThreads) =>
      prevThreads.map((thread) => {
        if (thread.id !== selectedConversation.id) {
          return thread
        }

        const updatedMessages: Message[] = [
          ...thread.messages,
          {
            id: messageId,
            author: 'me',
            text,
            time: timeLabel,
          },
        ]

        return {
          ...thread,
          messages: updatedMessages,
          lastMessage: text,
          time: timeLabel,
          unread: 0,
        }
      }),
    )

    setMessageDraft('')

    if (activePanel !== 'conversation') {
      setActivePanel('conversation')
    }
  }

  const handleComposerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSendMessage()
  }

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const isSendDisabled = messageDraft.trim().length === 0

  const handleStartCall = () => {
    if (!selectedConversation) {
      return
    }

    setCallTarget({
      label: selectedConversation.name,
      detail: selectedConversation.virtualNumber,
      avatar: selectedConversation.avatar,
    })
  }

  const handleEndCall = () => {
    setCallTarget(null)
  }

  const handleOpenDialpad = () => {
    setIsDialpadOpen(true)
  }

  const handleCloseDialpad = () => {
    setIsDialpadOpen(false)
  }

  const handleDialpadInput = (value: string) => {
    setDialpadNumber((prev) => {
      if (prev.length >= 18) {
        return prev
      }
      return prev + value
    })
  }

  const handleDialpadDelete = () => {
    setDialpadNumber((prev) => prev.slice(0, -1))
  }

  const handleDialpadClear = () => {
    setDialpadNumber('')
  }

  const handleDialpadCall = () => {
    const cleanNumber = dialpadNumber.trim()
    if (!cleanNumber) {
      return
    }

    setCallTarget({
      label: cleanNumber,
      detail: 'Direct dial',
      avatar: '☎️',
    })
    setDialpadNumber('')
    setIsDialpadOpen(false)
  }

  const renderMessageBubble = (message: Message) => {
    const isMine = message.author === 'me'
    return (
      <li key={message.id} className={`message ${isMine ? 'message--me' : 'message--them'}`}>
        <div className="message-bubble">{message.text}</div>
        <span className="message-time">{message.time}</span>
      </li>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="brand">
            <img className="logo-mark" src={systemicLogo} alt="Systemic logo" />
            <div className="brand-copy">
              <h1>Systemic Messenger</h1>
              <p>Stay in sync across teams, instantly.</p>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className="button secondary desktop-only">New Chat</button>
          <div className="avatar-small">JD</div>
      </div>
      </header>

      <div className="panel-toggle">
        <button
          onClick={() => setActivePanel('chats')}
          className={`segment-button ${activePanel === 'chats' ? 'is-active' : ''}`}
        >
          Chats
        </button>
        <button
          onClick={() => setActivePanel('conversation')}
          className={`segment-button ${activePanel === 'conversation' ? 'is-active' : ''}`}
        >
          Conversation
        </button>
        <button
          onClick={() => setActivePanel('details')}
          className={`segment-button ${activePanel === 'details' ? 'is-active' : ''}`}
        >
          Details
        </button>
      </div>

      <main className="workspace">
        <section className={`chat-list panel ${activePanel === 'chats' ? 'is-visible' : ''}`}>
          <div className="chat-search">
            <input placeholder="Search conversations" type="search" />
          </div>
          <h2 className="section-title">Inbox</h2>
          <ul className="chat-items">
            {threads.map((conversation) => {
              const isActive = conversation.id === selectedConversation?.id
              return (
                <li key={conversation.id}>
                  <button
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`chat-item ${isActive ? 'is-active' : ''}`}
                  >
                    <span className="chat-item-avatar">{conversation.avatar}</span>
                    <div className="chat-item-body">
                      <div className="chat-item-header">
                        <div>
                          <p className="chat-item-name">{conversation.name}</p>
                          <p className="chat-item-number">{conversation.virtualNumber}</p>
                        </div>
                        <span className="chat-item-time">{conversation.time}</span>
                      </div>
                      <p className="chat-item-preview">{conversation.lastMessage}</p>
                      <div className="chat-item-footer">
                        <span className="chat-item-status">{conversation.status}</span>
                        {conversation.unread ? (
                          <span className="chat-item-unread">{conversation.unread}</span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
          <button className="inbox-dial-button" type="button" onClick={handleOpenDialpad}>
            Open Dial Pad
          </button>
        </section>

        <section
          className={`conversation-panel panel ${activePanel === 'conversation' ? 'is-visible' : ''}`}
        >
          <div className="conversation-wrapper">
            <div className="conversation-header">
              <div className="conversation-avatar">{selectedConversation?.avatar}</div>
              <div className="conversation-meta">
                <p className="conversation-name">{selectedConversation?.name}</p>
                <p className="conversation-number">{selectedConversation?.virtualNumber}</p>
                <p className="conversation-status">{selectedConversation?.status}</p>
              </div>
              <div className="conversation-actions">
                <button className="call-button" onClick={handleStartCall}>
                  Call
                </button>
                <button className="meet-button">Meet</button>
              </div>
            </div>

            <div className="conversation-body" ref={conversationBodyRef}>
              <ul className="message-list">
                {selectedConversation?.messages.map((message) => renderMessageBubble(message))}
                <li ref={scrollAnchorRef} className="message message--anchor" aria-hidden />
              </ul>
            </div>

            <div className="composer">
              <form className="composer-box" onSubmit={handleComposerSubmit}>
                <input
                  className="composer-input"
                  placeholder="Write a message…"
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                />
                <div className="composer-actions">
                  <button className="emoji-button" type="button" aria-label="Insert emoji">
                    😊
                  </button>
                  <button
                    className="send-button"
                    type="submit"
                    aria-label="Send message"
                    disabled={isSendDisabled}
                  >
                    <img className="send-icon" src={sendIcon} alt="" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <aside className={`details-panel panel ${activePanel === 'details' ? 'is-visible' : ''}`}>
          <div className="details-card">
            <div className="details-avatar">{selectedConversation?.avatar}</div>
            <div>
              <p className="details-name">{selectedConversation?.name}</p>
              <p className="details-number">{selectedConversation?.virtualNumber}</p>
              <p className="details-role">{selectedConversation?.role}</p>
            </div>
            <span className="details-status">{selectedConversation?.status}</span>
          </div>

          <div className="details-section">
            <p className="details-section-title">Topics</p>
            <ul className="details-topics">
              {selectedConversation?.topics.map((topic) => (
                <li key={topic} className="details-topic">
                  {topic}
                </li>
              ))}
            </ul>
          </div>

          <div className="details-section">
            <p className="details-section-title">Location</p>
            <p className="details-location">{selectedConversation?.location}</p>
          </div>

        </aside>
      </main>

      {callTarget && (
        <div className="call-overlay" role="dialog" aria-modal="true">
          <div className="call-window">
            <div className="call-avatar">{callTarget.avatar ?? '☎️'}</div>
            <h2 className="call-name">{callTarget.label}</h2>
            {callTarget.detail ? <p className="call-detail">{callTarget.detail}</p> : null}
            <p className="call-status">Calling…</p>
            <div className="call-controls">
              <button className="call-control-button call-control-button--mute" type="button">
                🔇
              </button>
              <button
                className="call-control-button call-control-button--hangup"
                type="button"
                onClick={handleEndCall}
              >
                ⛔
              </button>
            </div>
          </div>
        </div>
      )}

      {isDialpadOpen && (
        <div className="dialpad-backdrop" role="presentation" onClick={handleCloseDialpad}>
          <div
            className="dialpad"
            role="dialog"
            aria-modal="true"
            aria-label="Dial pad"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dialpad-display">
              <input value={dialpadNumber} readOnly placeholder="Enter number" />
              <div className="dialpad-display-actions">
                <button
                  type="button"
                  className="dialpad-delete"
                  onClick={handleDialpadDelete}
                  aria-label="Delete digit"
                >
                  ⌫
                </button>
                <button type="button" onClick={handleDialpadClear} aria-label="Clear number">
                  ✕
                </button>
              </div>
            </div>
            <div className="dialpad-grid">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                <button
                  key={key}
                  type="button"
                  className="dialpad-key"
                  onClick={() => handleDialpadInput(key)}
                >
                  {key}
                </button>
              ))}
            </div>
            <div className="dialpad-actions">
              <button
                type="button"
                className="dialpad-call-button"
                onClick={handleDialpadCall}
                disabled={!dialpadNumber.trim()}
              >
                Dial
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default App
