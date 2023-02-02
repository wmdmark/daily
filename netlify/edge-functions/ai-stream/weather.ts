export const getWeather = async (
  lat: string | number,
  lon: string | number,
  timezone: string,
  dataSets = [
    "currentWeather",
    // "forecastDaily",
    // "forecastHourly",
    // "forecastNextHour",
  ]
) => {
  const dataSetsParam = dataSets.join(",")
  const url = `https://weatherkit.apple.com/api/v1/weather/en/${lat}/${lon}?dataSets=${dataSetsParam}&timezone=${timezone}`

  // add the token to your headers
  const token = Deno.env.get("WEATHER_TOKEN")

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    return new Response("Weather error", { status: 500 })
  }

  const data = await response.json()
  console.log(data)
  return data
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}

export const getWeatherInputData = (weatherData: any) => {
  console.log(weatherData)
  const current = weatherData.currentWeather

  const forecastData = {
    daylight: current.daylight,
    readTime: current.metadata.readTime,
    reportedTime: current.metadata.reportedTime,
    conditionCode: current.conditionCode,
    temperature: current.temperature,
    temperatureFahrenheit: celsiusToFahrenheit(current.temperature),
    temeratureApparent: current.temperatureApparent,
    temperatureApparentFahrenheit: celsiusToFahrenheit(
      current.temperatureApparent
    ),
    uvIndex: current.uvIndex,
    windSpeed: current.windSpeed,
    windDirection: current.windDirection,
    visibility: current.visibility,
    precipitationIntensity: current.precipitationIntensity,
    asOf: current.asOf,
  }

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

  return {
    current: forecastData,
    // daily: dailyData,
    // hourly: hourlyData,
  }
}
