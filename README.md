https://dev.iachieved.it/iachievedit/weatherkit-rest-api/

### JWT

```bash
openssl pkcs8 -nocrypt -in AuthKey_7W22P92RBD.p8 -out AuthKey_7W22P92RBD.pem
openssl ec -in AuthKey_7W22P92RBD.pem -pubout > AuthKey_7W22P92RBD.pub
python3 -c'import time; n=int(time.time()); print("\"iat\": %d," % n); print("\"exp\": %d," % (n+(90 * 24 * 3600)))'
curl "https://weatherkit.apple.com/api/v1/availability/32.779167/-96.808891?country=US" -H 'Authorization: Bearer <TOKEN>'


curl "https://weatherkit.apple.com/api/v1/weather/en_US/32.779167/-96.808891?dataSets=currentWeather" -H 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjdXMjJQOTJSQkQiLCJpZCI6IlRETktTRDczVFUuY29tLndtZG1hcmsud2VhdGhlci1zZXJ2aWNlIiwidHlwIjoiSldUIn0.eyJpc3MiOiJURE5LU0Q3M1RVIiwic3ViIjoiY29tLndtZG1hcmsud2VhdGhlci1zZXJ2aWNlIiwiaWF0IjoxNjc1MzAyODk3LCJleHAiOjE2ODMwNzg4OTd9.85c4uHrrkAXRgY8l-zbqnU--_9TKcJtg_q5mdf6oa0vfglTM1jmI85lNxdWyAasKI4kGIQXEUorra-dCnrqVeg'

curl "https://weatherkit.apple.com/api/v1/weather/en/34.8899/-82.4019?dataSets=currentWeather" -H "Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjdXMjJQOTJSQkQiLCJpZCI6IlRETktTRDczVFUuY29tLndtZG1hcmsud2VhdGhlci1zZXJ2aWNlIiwidHlwIjoiSldUIn0.eyJpc3MiOiJURE5LU0Q3M1RVIiwic3ViIjoiY29tLndtZG1hcmsud2VhdGhlci1zZXJ2aWNlIiwiaWF0IjoxNjc1MzAyODk3LCJleHAiOjE2ODMwNzg4OTd9.85c4uHrrkAXRgY8l-zbqnU--_9TKcJtg_q5mdf6oa0vfglTM1jmI85lNxdWyAasKI4kGIQXEUorra-dCnrqVeg"

```

![JWT.io Link](https://jwt.io/#debugger-io?token=eyJhbGciOiJFUzI1NiIsImtpZCI6IjdXMjJQOTJSQkQiLCJpZCI6IlRETktTRDczVFUuY29tLndtZG1hcmsud2VhdGhlci1zZXJ2aWNlIiwidHlwIjoiSldUIn0.eyJpc3MiOiJURE5LU0Q3M1RVIiwic3ViIjoiY29tLndtZG1hcmsud2VhdGhlci1zZXJ2aWNlIiwiaWF0IjoxNjc1MDk5OTA1LCJleHAiOjE2NzUxODYzMDV9.aZrVCNAsS4ZSYmEdtgNnf8Rgv7z92VOPHVPCQpWv7iWEX7Jfylye-j4BNanieSDF3yDCQXMZmWlvkPKLnlhTEA&publicKey=-----BEGIN%20PUBLIC%20KEY-----%0AMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAER4XbWhRud0OPriAvsOlQFZOgS8ZB%0AmJQiQwfkSwPycj0MZDT1s0PTv0222K0fQzDkFdRE%2BXAmBV3gUVQA14%2BNcA%3D%3D%0A-----END%20PUBLIC%20KEY-----)

```


### Weather conditions

- Clear
- Cloudy
- Dust
- Fog
- Haze
- MostlyClear
- MostlyCloudy
- PartlyCloudy
- ScatteredThunderstorms
- Smoke
- Breezy
- Windy
- Drizzle
- HeavyRain
- Rain
- Showers
- Flurries
- HeavySnow
- MixedRainAndSleet
- MixedRainAndSnow
- MixedRainfall
- MixedSnowAndSleet
- ScatteredShowers
- ScatteredSnowShowers
- Sleet
- Snow
- SnowShowers
- Blizzard
- BlowingSnow
- FreezingDrizzle
- FreezingRain
- Frigid
- Hail
- Hot
- Hurricane
- IsolatedThunderstorms
- SevereThunderstorm
- Thunderstorm
- Tornado
- TropicalStorm
```
