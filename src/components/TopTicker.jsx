import React from 'react'

export default function TopTicker({ ticker }) {
  if (!ticker || ticker.visible === false || !ticker.items || ticker.items.length === 0) {
    return null
  }

  // To ensure continuous scrolling, we duplicate the items
  const displayItems = [...ticker.items, ...ticker.items, ...ticker.items, ...ticker.items]

  return (
    <div className="top-ticker-strip">
      <div className="top-ticker-inner">
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
