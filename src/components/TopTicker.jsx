import React from 'react'

export default function TopTicker({ ticker }) {
  if (!ticker || ticker.visible === false || !ticker.items || ticker.items.length === 0) {
    return null
  }

  // To ensure continuous scrolling, we duplicate the items
  const displayItems = [...ticker.items, ...ticker.items, ...ticker.items, ...ticker.items]

  // Default to 35 seconds if not set
  const speed = ticker.speed || 35;

  return (
    <div className="top-ticker-strip">
      <div 
        className="top-ticker-inner" 
        style={{ animation: `top-ticker-scroll ${speed}s linear infinite` }}
      >
        {displayItems.map((item, i) => (
          <span key={i} className="top-ticker-item">
            <i className="fa-solid fa-bell top-ticker-icon" />
            {item.link ? (
              <a href={item.link} className="top-ticker-link">{item.text}</a>
            ) : (
              <span>{item.text}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
