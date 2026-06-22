'use client';

import { useState } from 'react';
import { decodeVin, getVehicleRecalls, type DecodedVin, type RecallItem } from '@/lib/api';
import { getDict } from '@/lib/i18n';
import { useLocale } from '@/components/LocaleProvider';

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;

export default function VinDecoder() {
  const t = getDict(useLocale()).vehicle;
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<DecodedVin | null>(null);
  const [recalls, setRecalls] = useState<{ count: number; results: RecallItem[] } | null>(null);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = vin.trim().toUpperCase();
    setError('');
    setVehicle(null);
    setRecalls(null);
    if (!VIN_RE.test(clean)) {
      setError(t.invalidVin);
      return;
    }
    setLoading(true);
    try {
      const data = await decodeVin(clean);
      if (!data) {
        setError(t.serviceError);
        return;
      }
      if (!data.valid) {
        setError(data.error === 'invalid_vin' ? t.invalidVin : data.error === 'not_decoded' ? t.notDecoded : t.serviceError);
        return;
      }
      setVehicle(data);
      if (data.make && data.model && data.year) {
        setRecalls(await getVehicleRecalls(data.make, data.model, data.year));
      } else {
        setRecalls({ count: 0, results: [] });
      }
    } catch {
      setError(t.serviceError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Buscador VIN */}
      <form onSubmit={onSubmit} className="relative">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] rounded-2xl blur-md opacity-30 group-focus-within:opacity-60 transition-opacity duration-300" />
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2 glass-strong rounded-2xl p-2">
            <input
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              placeholder={t.placeholder}
              maxLength={17}
              autoComplete="off"
              aria-label="VIN"
              className="flex-1 px-4 py-3 bg-transparent text-white placeholder-slate-500 focus:outline-none uppercase font-mono tracking-wider"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-[#00d4ff]/40 disabled:opacity-60 shrink-0"
            >
              {loading ? t.decoding : t.decode}
            </button>
          </div>
        </div>
      </form>
      <p className="text-slate-500 text-xs mt-3 text-center">{t.whereIsVin}</p>

      {error && (
        <div className="mt-6 glass rounded-xl p-4 text-center" style={{ borderColor: '#ff4d4d40' }}>
          <p className="text-crit text-sm">{error}</p>
        </div>
      )}

      {/* Datos del vehículo */}
      {vehicle?.valid && (
        <div className="mt-8 space-y-6">
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">🚗</span>
              <div>
                <h2 className="text-2xl font-bold text-white leading-tight">
                  {[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' ')}
                </h2>
                <p className="text-slate-500 text-xs font-mono mt-0.5">{vehicle.vin}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label={t.fMake} value={vehicle.make} />
              <Field label={t.fModel} value={vehicle.model} />
              <Field label={t.fYear} value={vehicle.year} />
              <Field label={t.fTrim} value={vehicle.trim} />
              <Field label={t.fEngine} value={[vehicle.displacementL ? `${vehicle.displacementL}L` : null, vehicle.engineCylinders ? `${vehicle.engineCylinders} cil` : null].filter(Boolean).join(' ') || null} />
              <Field label={t.fFuel} value={vehicle.fuelType} />
              <Field label={t.fBody} value={vehicle.bodyClass} />
              <Field label={t.fDrive} value={vehicle.driveType} />
              <Field label={t.fTransmission} value={vehicle.transmission} />
              <Field label={t.fType} value={vehicle.vehicleType} />
              <Field label={t.fManufacturer} value={vehicle.manufacturer} />
              <Field label={t.fPlant} value={vehicle.plantCountry} />
            </div>
          </div>

          {/* Recalls */}
          {recalls && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-warn shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <h3 className="text-xl font-bold text-white">{t.recallsTitle}</h3>
                {recalls.count > 0 && (
                  <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold bg-warn/15 text-warn">
                    {t.recallsCountTpl.replace('%s', String(recalls.count))}
                  </span>
                )}
              </div>

              {recalls.count === 0 ? (
                <p className="text-diag text-sm">{t.noRecalls}</p>
              ) : (
                <div className="space-y-3">
                  {recalls.results.map((r, i) => (
                    <div key={r.campaign ?? i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <p className="text-warn font-semibold text-sm">{r.component}</p>
                        {r.campaign && <span className="text-slate-500 text-xs font-mono">{t.rCampaign}: {r.campaign}</span>}
                      </div>
                      {r.summary && <p className="text-slate-300 text-sm mb-2 leading-relaxed">{r.summary}</p>}
                      {r.consequence && (
                        <p className="text-slate-400 text-xs mb-1"><strong className="text-crit">{t.rConsequence}:</strong> {r.consequence}</p>
                      )}
                      {r.remedy && (
                        <p className="text-slate-400 text-xs"><strong className="text-diag">{t.rRemedy}:</strong> {r.remedy}</p>
                      )}
                    </div>
                  ))}
                  <p className="text-slate-600 text-xs pt-2">{t.recallNote}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-white font-medium text-sm leading-snug">{value}</p>
    </div>
  );
}
