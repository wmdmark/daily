let retryCount = 0

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const getWeather = async (
  latitude: string | number,
  longitude: string | number,
  timezone: string,
  dataSets = [
    "currentWeather",
    // "forecastDaily",
    // "forecastHourly",
    // "forecastNextHour",
  ]
) => {
  const dataSetsParam = dataSets.join(",")
  // ?timezone=${timezone}
  const url = `https://weatherkit.apple.com/api/v1/weather/en_US/${latitude}/${longitude}?dataSets=${dataSetsParam}`

  // add the token to your headers
  const token = Deno.env.get("WEATHER_TOKEN")

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }
  try {
    let response = await fetch(url, config)

    if (response.bodyUsed) {
      console.log("body already used")

      // can we clone the response?
      response = response.clone()
      // now we can read the body again?
    }

    if (!response.ok) {
      // console.log(`curl "${url}" -H "Authorization: Bearer ${token}"`)
      throw new Error("WeatherKit error")
    } else {
      const weatherData = await response.json()
      if (Object.keys(weatherData).length === 0) {
        console.log("got empty weather data?", response)
        // console.log(`curl "${url}" -H "Authorization: Bearer ${token}"`)

        // try again
        if (retryCount < 2) {
          await delay(1000)
          retryCount++
          return getWeather(latitude, longitude, timezone, dataSets)
        } else {
          throw new Error("WeatherKit error: empty data")
        }
      }
      // console.log("got weather data", weatherData)
      return weatherData
    }
  } catch (e) {
    console.log(e)
    // console.log(`curl "${url}" -H "Authorization: Bearer ${token}"`)
    throw new Error("WeatherKit error")
  }
}
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}

export const getWeatherInputData = (weatherData: any) => {
  const current = weatherData.currentWeather

  const forecastData = {
    ...current,
    temperatureFahrenheit: celsiusToFahrenheit(current.temperature),
    temperatureApparentFahrenheit: celsiusToFahrenheit(
      current.temperatureApparent
    ),
  }

  // add in some forecastNextHour data

  // const dailyData = weatherData.forecastDaily.days.map((day: any) => {
  //   return {
  //     forecastStart: day.forecastStart,
  //     forecastEnd: day.forecastEnd,
  //     conditionCode: day.conditionCode,
  //     precipitationAmount: day.precipitationAmount,
  //     precipitationChance: day.precipitationChance,
  //     precipitationType: day.precipitationType,
  //     snowfallAmount: day.snowfallAmount,
  //     solarMidnight: day.solarMidnight,
  //     solarNoon: day.solarNoon,
  //     sunrise: day.sunrise,
  //     moonPhase: day.moonPhase,
  //     moonRise: day.moonRise,
  //     moonSet: day.moonSet,
  //     temperatureMax: day.temperatureMax,
  //     temperatureMaxFahrenheit: celsiusToFahrenheit(day.temperatureMax),
  //     temperatureMin: day.temperatureMin,
  //     temperatureMinFahrenheit: celsiusToFahrenheit(day.temperatureMin),
  //   }
  // })

  // const hourlyData = weatherData.forecastHourly.hours.map((hour: any) => {
  //   return {
  //     forecastStart: hour.forecastStart,
  //     conditionCode: hour.conditionCode,
  //     daylight: hour.daylight,
  //     precipitationChance: hour.precipitationChance,
  //     precipitationAmount: hour.precipitationAmount,
  //     precipitationType: hour.precipitationType,
  //     snowfallIntensity: hour.snowfallIntensity,
  //     snowfallAmount: hour.snowfallAmount,
  //     temperature: hour.temperature,
  //     temperatureApparent: hour.temperatureApparent,
  //     temperatureDewPoint: hour.temperatureDewPoint,
  //     uvIndex: hour.uvIndex,
  //     visibility: hour.visibility,
  //     windDirection: hour.windDirection,
  //     windGust: hour.windGust,
  //     windSpeed: hour.windSpeed,
  //   }
  // })

  return forecastData
}
