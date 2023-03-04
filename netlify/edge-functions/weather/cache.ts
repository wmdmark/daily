import type { Context } from "https://edge.netlify.com"
import { Redis } from "https://deno.land/x/upstash_redis/mod.ts"

const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
})

const slugify = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export const getRefreshInterval = (cacheIntervalMinutes = 10) => {
  const minutes = new Date().getMinutes()
  const intervalStart =
    Math.floor(minutes / cacheIntervalMinutes) * cacheIntervalMinutes
  const intervalEnd = intervalStart + cacheIntervalMinutes
  const minutesUntilNextInterval = intervalEnd - minutes

  return {
    intervalStart,
    intervalEnd,
    minutesUntilNextInterval,
  }
}

export const getCacheKey = (context: Context, cacheIntervalMinutes = 10) => {
  const location: any = {
    city: context.geo.city,
    state: context.geo.subdivision?.name,
    country: context.geo.country?.name,
  }
  const hourOfDay = new Date().getHours()
  const minutes = new Date().getMinutes()

  // we want a timekey that caches every 10 minutes
  const timeKey = `${hourOfDay}-${
    Math.floor(minutes / cacheIntervalMinutes) * cacheIntervalMinutes
  }`
  const key = `${slugify(location.city)}-${slugify(location.state)}-${slugify(
    location.country
  )}-${timeKey}`
  return key
}

export const getCachedData = async (context: Context) => {
  const key = getCacheKey(context)
  const data = await redis.get(key)
  return data
}

export const cacheByLocationAndTime = (context: Context, data: any) => {
  // cache by location + hour of day
  const key = getCacheKey(context)
  console.log("Caching data for", key, data)
  redis.set(key, JSON.stringify(data))
  return data
}
