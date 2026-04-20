export default function StarRating({ value }) {
  const stars = Math.round((value / 100) * 5)
  return (
    <div className="star-rating" title={`Popularity: ${Math.round(value)}%`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= stars ? 'star star-filled' : 'star star-empty'}>★</span>
      ))}
      <span className="star-pct">{Math.round(value)}%</span>
    </div>
  )
}
