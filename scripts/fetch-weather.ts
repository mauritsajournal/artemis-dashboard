/**
 * Fetch weather data for Launch Pad 39B (28.5721°N, 80.6480°W)
 * Sources: Open-Meteo (free, no API key) + NOAA SWPC (free, no API key)
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const DATA_DIR = resolve(import.meta.dirname ?? '.', '..', 'data');
const OUTPUT_FILE = resolve(DATA_DIR, 'weather.json');

// KSC Launch Pad 39B coordinates
const LAT = 28.5721;
const LON = -80.6480;

const OPEN_METEO_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,wind_speed_10m,wind_gusts_10m,cloud_cover,precipitation,weather_code&hourly=temperature_2m,wind_speed_10m,wind_gusts_10m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max&timezone=America%2FNew_York&forecast_days=5`;

const NOAA_KP_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
const NOAA_SOLAR_WIND_URL = 'https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json';

interface WeatherData {
  fetchedAt: string;
  location: { lat: number; lon: number; name: string };
  current: {
    temperature: number;
    windSpeed: number;
    windGusts: number;
    cloudCover: number;
    precipitation: number;
    weatherCode: number;
  } | null;
  hourly: {
    time: string[];
    temperature: number[];
    windSpeed: number[];
    windGusts: number[];
    precipitationProbability: number[];
  } | null;
  daily: {
    time: string[];
    weatherCode: number[];
    temperatureMax: number[];
    temperatureMin: number[];
    windSpeedMax: number[];
    precipitationProbabilityMax: number[];
  } | null;
  solar: {
    kpIndex: number | null;
    kpTimestamp: string | null;
    solarWindSpeed: number | null;
    solarWindDensity: number | null;
  };
}

async function fetchJSON(url: string, label: string): Promise<unknown | null> {
  try {
    console.log(`  Fetching ${label}...`);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ArtemisIIDashboard/1.0 (github.com/mauritsajournal/artemis-dashboard)' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.warn(`  WARNING: ${label} returned ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`  WARNING: ${label} failed: ${(err as Error).message}`);
    return null;
  }
}

async function main(): Promise<void> {
  console.log('Fetching weather data for Launch Pad 39B...');

  // Ensure data directory exists
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  // Fetch all data sources in parallel
  const [meteoRaw, kpRaw, solarWindRaw] = await Promise.all([
    fetchJSON(OPEN_METEO_URL, 'Open-Meteo'),
    fetchJSON(NOAA_KP_URL, 'NOAA Kp-index'),
    fetchJSON(NOAA_SOLAR_WIND_URL, 'NOAA Solar Wind'),
  ]);

  // Parse Open-Meteo
  const meteo = meteoRaw as Record<string, unknown> | null;
  const currentMeteo = meteo?.current as Record<string, unknown> | undefined;
  const hourlyMeteo = meteo?.hourly as Record<string, unknown[]> | undefined;
  const dailyMeteo = meteo?.daily as Record<string, unknown[]> | undefined;

  // Parse NOAA Kp-index (array of objects with time_tag, Kp fields)
  let kpIndex: number | null = null;
  let kpTimestamp: string | null = null;
  if (Array.isArray(kpRaw) && kpRaw.length > 0) {
    const lastEntry = kpRaw[kpRaw.length - 1] as Record<string, unknown>;
    if (lastEntry && 'Kp' in lastEntry) {
      kpTimestamp = lastEntry.time_tag as string ?? null;
      kpIndex = typeof lastEntry.Kp === 'number' ? Math.round(lastEntry.Kp * 100) / 100 : null;
    }
  }

  // Parse NOAA Solar Wind (array of arrays, first row is header)
  let solarWindSpeed: number | null = null;
  let solarWindDensity: number | null = null;
  if (Array.isArray(solarWindRaw) && solarWindRaw.length > 1) {
    // Find the last non-null entry
    for (let i = solarWindRaw.length - 1; i > 0; i--) {
      const entry = solarWindRaw[i] as string[];
      if (entry && entry.length >= 3) {
        const density = parseFloat(entry[1]);
        const speed = parseFloat(entry[2]);
        if (!isNaN(speed) && !isNaN(density)) {
          solarWindSpeed = speed;
          solarWindDensity = density;
          break;
        }
      }
    }
  }

  const data: WeatherData = {
    fetchedAt: new Date().toISOString(),
    location: { lat: LAT, lon: LON, name: 'Launch Pad 39B, Kennedy Space Center' },
    current: currentMeteo ? {
      temperature: currentMeteo.temperature_2m as number,
      windSpeed: currentMeteo.wind_speed_10m as number,
      windGusts: currentMeteo.wind_gusts_10m as number,
      cloudCover: currentMeteo.cloud_cover as number,
      precipitation: currentMeteo.precipitation as number,
      weatherCode: currentMeteo.weather_code as number,
    } : null,
    hourly: hourlyMeteo ? {
      time: hourlyMeteo.time as string[],
      temperature: hourlyMeteo.temperature_2m as number[],
      windSpeed: hourlyMeteo.wind_speed_10m as number[],
      windGusts: hourlyMeteo.wind_gusts_10m as number[],
      precipitationProbability: hourlyMeteo.precipitation_probability as number[],
    } : null,
    daily: dailyMeteo ? {
      time: dailyMeteo.time as string[],
      weatherCode: dailyMeteo.weather_code as number[],
      temperatureMax: dailyMeteo.temperature_2m_max as number[],
      temperatureMin: dailyMeteo.temperature_2m_min as number[],
      windSpeedMax: dailyMeteo.wind_speed_10m_max as number[],
      precipitationProbabilityMax: dailyMeteo.precipitation_probability_max as number[],
    } : null,
    solar: {
      kpIndex,
      kpTimestamp,
      solarWindSpeed,
      solarWindDensity,
    },
  };

  // If we got nothing from any source, try to keep stale data
  if (!data.current && !data.solar.kpIndex) {
    if (existsSync(OUTPUT_FILE)) {
      console.warn('WARNING: All fetches failed. Keeping stale data.');
      const stale = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
      stale._staleWarning = `All fetches failed at ${new Date().toISOString()}. Showing data from ${stale.fetchedAt}`;
      writeFileSync(OUTPUT_FILE, JSON.stringify(stale, null, 2));
      return;
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`Weather data written to ${OUTPUT_FILE}`);
  console.log(`  Temperature: ${data.current?.temperature ?? 'N/A'}°C`);
  console.log(`  Wind: ${data.current?.windSpeed ?? 'N/A'} km/h (gusts: ${data.current?.windGusts ?? 'N/A'})`);
  console.log(`  Kp-index: ${data.solar.kpIndex ?? 'N/A'}`);
}

main().catch((err) => {
  console.error('Fatal error in weather fetch:', err);
  process.exit(1);
});
