"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Select from "@/components/Select";
import Alert from "@/components/Alert";
import evModels from "@/lib/tools/evCharging/data/evModels.json";


export default function EVChargingPage() {
  // Vehicle state
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [batteryKwh, setBatteryKwh] = useState<string>("");
  const [efficiencyMpkwh, setEfficiencyMpkwh] = useState<string>("");
  const [autoFillSource, setAutoFillSource] = useState<string>("");
  const [fetching, setFetching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Charging session state
  const [socFrom, setSocFrom] = useState<string>("20");
  const [socTo, setSocTo] = useState<string>("80");

  // Rates state
  const [homeRatePeak, setHomeRatePeak] = useState<string>("");
  const [homeRateOffPeak, setHomeRateOffPeak] = useState<string>("");
  const [publicRateSlow, setPublicRateSlow] = useState<string>("35");
  const [publicRateFast, setPublicRateFast] = useState<string>("55");
  const [publicRateRapid, setPublicRateRapid] = useState<string>("75");

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lossFactor, setLossFactor] = useState<string>("0.10");

  // Build make/model options from bundled list
  const makeOptions = Array.from(new Set(evModels.map((ev: any) => ev.make))).map((make) => ({ value: make, label: make }));
  const modelOptions = make
    ? evModels.filter((ev: any) => ev.make === make).map((ev: any) => ({ value: ev.model, label: ev.model }))
    : [];

  // Fetch spec from API
  const fetchSpec = async () => {
    setFetching(true);
    setNotFound(false);
    setAutoFillSource("");
    try {
      const res = await fetch(`/api/ev/spec?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
      const data = await res.json();
      if (data.found) {
        setBatteryKwh(data.batteryKwh ? String(data.batteryKwh) : "");
        setEfficiencyMpkwh(data.efficiencyMpkwh ? String(data.efficiencyMpkwh) : "");
        setAutoFillSource(data.source || "auto-fill");
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
    setFetching(false);
  };

  // Auto-select battery if model is chosen from list
  useEffect(() => {
    if (make && model) {
      const found = evModels.find((ev: any) => ev.make === make && ev.model === model);
      if (found) {
        setBatteryKwh(String(found.batteryKwh));
        setEfficiencyMpkwh(found.efficiencyMpkwh ? String(found.efficiencyMpkwh) : "");
        setAutoFillSource("bundled");
        setNotFound(false);
      } else {
        setAutoFillSource("");
      }
    }
  }, [make, model]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">EV Charging Cost & Insights</h1>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        Estimate your charging cost, compare home vs public rates, and understand cost per mile.
      </p>

      {/* Vehicle Section */}
      <Card className="mb-6 p-4">
        <h2 className="text-xl font-semibold mb-2">A) Vehicle</h2>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <label className="flex flex-col gap-1 flex-1">
              <span className="text-sm font-medium">Make</span>
              <Select
                value={make}
                onChange={setMake}
                options={makeOptions}
                placeholder="Select make"
              />
            </label>
            <label className="flex flex-col gap-1 flex-1">
              <span className="text-sm font-medium">Model</span>
              <Select
                value={model}
                onChange={setModel}
                options={modelOptions}
                placeholder="Select model"
                disabled={!make}
              />
            </label>
          </div>
          <div className="flex gap-2 items-end">
            <Button
              type="button"
              onClick={fetchSpec}
              disabled={!make || !model || fetching}
              className="h-12"
            >
              {fetching ? "Fetching..." : "Fetch spec"}
            </Button>
            {autoFillSource && (
              <span className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                Auto-filled from {autoFillSource}
              </span>
            )}
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Battery capacity (kWh)</span>
            <Input
              type="number"
              min={1}
              value={batteryKwh}
              onChange={e => { setBatteryKwh(e.target.value); setAutoFillSource(""); }}
              placeholder="Battery capacity (kWh)"
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Efficiency (miles/kWh)</span>
            <Input
              type="number"
              min={1}
              value={efficiencyMpkwh}
              onChange={e => { setEfficiencyMpkwh(e.target.value); setAutoFillSource(""); }}
              placeholder="Efficiency (optional)"
            />
          </label>
          {notFound && (
            <div className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded p-2 mt-2">
              Could not auto-fill this model. Please enter battery size manually.
            </div>
          )}
        </div>
      </Card>


      {/* Charging Session Section */}
      <Card className="mb-6 p-4">
        <h2 className="text-xl font-semibold mb-2">B) Charging session</h2>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Current SoC (%)</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={socFrom}
              onChange={e => setSocFrom(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Target SoC (%)</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={socTo}
              onChange={e => setSocTo(e.target.value)}
              required
            />
          </label>
        </div>
      </Card>


      {/* Electricity Rates Section */}
      <Card className="mb-6 p-4">
        <h2 className="text-xl font-semibold mb-2">C) Electricity rates</h2>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Home peak rate (p/kWh)</span>
            <Input
              type="number"
              min={0}
              value={homeRatePeak}
              onChange={e => setHomeRatePeak(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Home off-peak rate (p/kWh) (optional)</span>
            <Input
              type="number"
              min={0}
              value={homeRateOffPeak}
              onChange={e => setHomeRateOffPeak(e.target.value)}
            />
          </label>
          <Alert variant="info">
            Typical UK public charging rates — edit if needed.
          </Alert>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Public slow (p/kWh)</span>
            <Input
              type="number"
              min={0}
              value={publicRateSlow}
              onChange={e => setPublicRateSlow(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Public fast (p/kWh)</span>
            <Input
              type="number"
              min={0}
              value={publicRateFast}
              onChange={e => setPublicRateFast(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Public rapid (p/kWh)</span>
            <Input
              type="number"
              min={0}
              value={publicRateRapid}
              onChange={e => setPublicRateRapid(e.target.value)}
              required
            />
          </label>
        </div>
      </Card>

      {/* Advanced Section */}
      <div className="mb-6">
        <button
          type="button"
          className="text-blue-600 dark:text-blue-400 underline text-sm mb-2"
          onClick={() => setShowAdvanced(v => !v)}
        >
          {showAdvanced ? "Hide Advanced" : "Show Advanced"}
        </button>
        {showAdvanced && (
          <Card className="p-4">
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Efficiency (miles/kWh)</span>
                <Input
                  type="number"
                  min={1}
                  value={efficiencyMpkwh}
                  onChange={e => setEfficiencyMpkwh(e.target.value)}
                  placeholder="Efficiency (optional)"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Charging loss factor (0–0.25)</span>
                <Input
                  type="number"
                  min={0}
                  max={0.25}
                  step={0.01}
                  value={lossFactor}
                  onChange={e => setLossFactor(e.target.value)}
                  required
                />
              </label>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Most EVs lose 10% of energy during charging. Adjust if you know your car’s typical loss.
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Results Section */}
      {/* Disclaimer block above results */}
      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded">
        <strong className="block mb-1">Disclaimer:</strong>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Estimates only. Actual charging costs vary by tariff, network, location, and time.<br />
          Public charging rates shown are typical UK estimates unless you enter your own.<br />
          No guaranteed savings. Use results as guidance.
        </span>
      </div>
      <Card className="mb-6 p-4">
        <h2 className="text-xl font-semibold mb-2">D) Results</h2>
        {(() => {
          // Parse and validate inputs
          const parsedInputs = {
            batteryKwh: Number(batteryKwh),
            efficiencyMpkwh: efficiencyMpkwh ? Number(efficiencyMpkwh) : undefined,
            socFrom: Number(socFrom),
            socTo: Number(socTo),
            homeRatePeakPence: Number(homeRatePeak),
            homeRateOffPeakPence: homeRateOffPeak ? Number(homeRateOffPeak) : undefined,
            publicRateSlowPence: Number(publicRateSlow),
            publicRateFastPence: Number(publicRateFast),
            publicRateRapidPence: Number(publicRateRapid),
            lossFactor: Number(lossFactor),
          };
          // Import validation and calculation
          // @ts-ignore
          const { validateEvChargingInputs } = require("@/lib/tools/evCharging/types");
          // @ts-ignore
          const { calculateEvCharging, formatCurrencyGBP } = require("@/lib/tools/evCharging/calc");
          const errors = validateEvChargingInputs(parsedInputs);
          if (errors.length > 0) {
            return (
              <Alert variant="warning">
                <div className="text-red-700 dark:text-red-300">
                  <strong>Input error:</strong>
                  <ul className="list-disc ml-5 mt-1">
                    {errors.map((err: string, i: number) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              </Alert>
            );
          }
          const results = calculateEvCharging(parsedInputs);
          return (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[180px]">
                  <div className="text-xs text-gray-500 mb-1">Energy needed</div>
                  <div className="text-lg font-semibold">{results.kwhNeeded} kWh</div>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <div className="text-xs text-gray-500 mb-1">With charging loss</div>
                  <div className="text-lg font-semibold">{results.kwhWithLoss} kWh</div>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Session cost</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                    <div className="text-xs text-gray-500">Home (peak)</div>
                    <div className="font-bold">{formatCurrencyGBP(results.costsGBP.homePeak)}</div>
                  </div>
                  {results.costsGBP.homeOffPeak !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                      <div className="text-xs text-gray-500">Home (off-peak)</div>
                      <div className="font-bold">{formatCurrencyGBP(results.costsGBP.homeOffPeak!)}</div>
                    </div>
                  )}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                    <div className="text-xs text-gray-500">Public (slow)</div>
                    <div className="font-bold">{formatCurrencyGBP(results.costsGBP.publicSlow)}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                    <div className="text-xs text-gray-500">Public (fast)</div>
                    <div className="font-bold">{formatCurrencyGBP(results.costsGBP.publicFast)}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                    <div className="text-xs text-gray-500">Public (rapid)</div>
                    <div className="font-bold">{formatCurrencyGBP(results.costsGBP.publicRapid)}</div>
                  </div>
                </div>
              </div>
              {results.costPerMilePence && (
                <div>
                  <div className="font-semibold mb-1 mt-2">Cost per mile (pence)</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                      <div className="text-xs text-gray-500">Home (peak)</div>
                      <div className="font-bold">{results.costPerMilePence.homePeak}p</div>
                    </div>
                    {results.costPerMilePence.homeOffPeak !== undefined && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                        <div className="text-xs text-gray-500">Home (off-peak)</div>
                        <div className="font-bold">{results.costPerMilePence.homeOffPeak}p</div>
                      </div>
                    )}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                      <div className="text-xs text-gray-500">Public (slow)</div>
                      <div className="font-bold">{results.costPerMilePence.publicSlow}p</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                      <div className="text-xs text-gray-500">Public (fast)</div>
                      <div className="font-bold">{results.costPerMilePence.publicFast}p</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                      <div className="text-xs text-gray-500">Public (rapid)</div>
                      <div className="font-bold">{results.costPerMilePence.publicRapid}p</div>
                    </div>
                  </div>
                </div>
              )}
              {results.insights.length > 0 && (
                <div className="mt-2">
                  <div className="font-semibold mb-1">Insights</div>
                  <ul className="list-disc ml-5 text-sm text-blue-800 dark:text-blue-200">
                    {results.insights.map((insight: string, i: number) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })()}
      </Card>

      {/* Disclaimer Section at bottom */}
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded">
        <strong className="block mb-1">Disclaimer:</strong>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Estimates only. Actual charging costs vary by tariff, network, location, and time.<br />
          Public charging rates shown are typical UK estimates unless you enter your own.<br />
          No guaranteed savings. Use results as guidance.
        </span>
      </div>
    </div>
  );
}
