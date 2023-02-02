import * as jwt from "https://deno.land/x/djwt@v2.8/mod.ts"

const WEATHERKIT_SERVICE_ID = ""
const WEATHERKIT_TEAM_ID = ""
const WEATHERKIT_KID = ""
const WEATHERKIT_KEY = ""
const WEATHERKIT_FULL_ID = `${WEATHERKIT_TEAM_ID}.${WEATHERKIT_SERVICE_ID}`

async function fetchWeatherkit(
  lang = "en",
  lat = "29.8752",
  lon = "-98.2625",
  country = "US",
  timezone = "US/Chicago",
  datasets = "currentWeather,forecastDaily,forecastHourly,forecastNextHour"
) {
  const url = `https://weatherkit.apple.com/api/v1/weather/${lang}/${lat}/${lon}?dataSets=${datasets}&countryCode=${country}&timezone=${timezone}`
  const now = new Date(Date.now())
  const exp = new Date(now.getTime() + 60 * 60 * 1000)
  const tokenBody = {
    sub: WEATHERKIT_SERVICE_ID,
    iss: WEATHERKIT_TEAM_ID,
    exp: exp,
    iat: now,
  }
  const tokenHeaders = {
    kid: WEATHERKIT_KID,
    id: WEATHERKIT_FULL_ID,
  }
  const token = jwt.sign(
    tokenBody,
    { key: WEATHERKIT_KEY, header: tokenHeaders },
    { algorithm: "ES256" }
  )
  const headers = new Headers()
  headers.set("Authorization", `Bearer ${token}`)
  const response = await fetch(url, { headers })
  return await response.json()
}

export { fetchWeatherkit }
