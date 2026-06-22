import { Injectable } from '@nestjs/common';

/* Enriquecimiento por vehículo (Fase 4): proxy a las APIs públicas de NHTSA.
   - vPIC DecodeVinValues: decodifica el VIN → marca, modelo, año, motor, etc.
   - Recalls byVehicle: llamados a revisión por marca/modelo/año.
   Se cachea en memoria (24 h) porque las respuestas casi no cambian. */

const VPIC_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues';
const RECALLS_URL = 'https://api.nhtsa.gov/recalls/recallsByVehicle';
const TTL_MS = 1000 * 60 * 60 * 24;
const MAX_CACHE_ENTRIES = 500; // techo de entradas para evitar fuga de memoria
const FETCH_TIMEOUT_MS = 8000; // aborta llamadas colgadas a NHTSA

export interface DecodedVin {
  valid: boolean;
  vin: string;
  error?: string;
  make?: string | null;
  model?: string | null;
  year?: string | null;
  manufacturer?: string | null;
  vehicleType?: string | null;
  bodyClass?: string | null;
  trim?: string | null;
  engineCylinders?: string | null;
  displacementL?: number | null;
  engineModel?: string | null;
  fuelType?: string | null;
  driveType?: string | null;
  transmission?: string | null;
  plantCountry?: string | null;
  errorText?: string | null;
}

export interface RecallItem {
  campaign: string | null;
  component: string | null;
  summary: string | null;
  consequence: string | null;
  remedy: string | null;
  date: string | null;
}

@Injectable()
export class VehicleService {
  private cache = new Map<string, { at: number; data: unknown }>();

  private async cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < TTL_MS) return hit.data as T;
    const data = await fn();
    this.cache.set(key, { at: Date.now(), data });
    // Evicción FIFO al superar el techo (Map conserva orden de inserción).
    if (this.cache.size > MAX_CACHE_ENTRIES) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) this.cache.delete(oldest);
    }
    return data;
  }

  async decodeVin(vinRaw: string): Promise<DecodedVin> {
    const vin = (vinRaw || '').trim().toUpperCase();
    // VIN estándar: 17 caracteres alfanuméricos sin I, O ni Q.
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      return { valid: false, vin, error: 'invalid_vin' };
    }
    return this.cached(`vin:${vin}`, async () => {
      try {
        const res = await fetch(`${VPIC_URL}/${vin}?format=json`, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
        if (!res.ok) return { valid: false, vin, error: 'service_error' };
        const json = (await res.json()) as { Results?: Record<string, string>[] };
        const r = json.Results?.[0] ?? {};
        if (!r.Make && !r.Model) return { valid: false, vin, error: 'not_decoded' };
        const num = (v?: string) => {
          const n = v ? parseFloat(v) : NaN;
          return Number.isFinite(n) ? Math.round(n * 10) / 10 : null;
        };
        const clean = (v?: string) => (v && v.trim() ? v.trim() : null);
        const errClean = (r.ErrorCode ?? '').split(',')[0].trim() === '0';
        return {
          valid: true,
          vin,
          make: clean(r.Make),
          model: clean(r.Model),
          year: clean(r.ModelYear),
          manufacturer: clean(r.Manufacturer),
          vehicleType: clean(r.VehicleType),
          bodyClass: clean(r.BodyClass),
          trim: clean(r.Trim),
          engineCylinders: clean(r.EngineCylinders),
          displacementL: num(r.DisplacementL),
          engineModel: clean(r.EngineModel),
          fuelType: clean(r.FuelTypePrimary),
          driveType: clean(r.DriveType),
          transmission: clean(r.TransmissionStyle),
          plantCountry: clean(r.PlantCountry),
          errorText: errClean ? null : clean(r.ErrorText),
        } as DecodedVin;
      } catch {
        return { valid: false, vin, error: 'service_error' };
      }
    });
  }

  async getRecalls(make?: string, model?: string, year?: string): Promise<{ count: number; results: RecallItem[] }> {
    if (!make || !model || !year) return { count: 0, results: [] };
    const key = `recalls:${make}:${model}:${year}`.toLowerCase();
    return this.cached(key, async () => {
      try {
        const url = `${RECALLS_URL}?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
        if (!res.ok) return { count: 0, results: [] };
        const json = (await res.json()) as { Count?: number; results?: Record<string, string>[] };
        const results: RecallItem[] = (json.results ?? []).map((x) => ({
          campaign: x.NHTSACampaignNumber || null,
          component: x.Component || null,
          summary: x.Summary || null,
          consequence: x.Consequence || null,
          remedy: x.Remedy || null,
          date: x.ReportReceivedDate || null,
        }));
        return { count: json.Count ?? results.length, results };
      } catch {
        return { count: 0, results: [] };
      }
    });
  }
}
