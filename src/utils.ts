export const getLocalDateTime = () => {
  // return the current date and time Thu, Feb 2nd h:MM am/pm"

  const date = new Date()
  const day = date.toLocaleString("en-us", { weekday: "short" })
  const month = date.toLocaleString("en-us", { month: "short" })
  const dayOfMonth = date.getDate()
  const hour = date.getHours()
  // pad the minutes
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const ampm = hour >= 12 ? "pm" : "am"
  const hour12 = hour % 12 || 12

  return `${day}, ${month} ${dayOfMonth}th ${hour12}:${minutes} ${ampm}`
}

export const preloadImage = async (url: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}
