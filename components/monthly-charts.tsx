"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCurrency } from "@/lib/utils";

type OverviewChartProps = {
  entries: number;
  payables: number;
  receivables: number;
  expenses: number;
  leftover: number;
};

type ClassificationChartProps = {
  necessary: number;
  optional: number;
  leisure: number;
  investment: number;
};

const overviewColors = ["#4ade80", "#facc15", "#38bdf8", "#f472b6", "#a78bfa"];
const classificationColors = ["#9333ea", "#06b6d4", "#39ff14", "#d1d5db"];

function tooltipFormatter(value: unknown) {
  const baseValue = Array.isArray(value) ? value[0] : value;
  const normalized = typeof baseValue === "number" ? baseValue : Number(baseValue ?? 0);
  return [formatCurrency(normalized), "Valor"] as [string, string];
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number | string; color?: string }>; label?: string }) {
  if (!active || !payload?.length) {
    return null;
  }

  const rawValue = payload[0]?.value;
  const value = typeof rawValue === "number" ? rawValue : Number(rawValue ?? 0);
  const color = payload[0]?.color ?? "#e5eefb";

  return (
    <div className="min-w-44 rounded-2xl border border-white/15 bg-slate-950/95 px-4 py-3 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-[13px] font-semibold text-white">{label}</p>
      </div>
      <p className="mt-2 text-[13px] text-slate-200">Valor: {formatCurrency(value)}</p>
    </div>
  );
}

export function OverviewBarChart(props: OverviewChartProps) {
  const data = [
    { name: "Entradas", value: props.entries },
    { name: "A pagar", value: props.payables },
    { name: "A receber", value: props.receivables },
    { name: "Contas", value: props.expenses },
    { name: "Sobra", value: props.leftover }
  ];

  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(Number(value)).replace(",00", "")} width={70} />
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.06)" }} content={<ChartTooltip />} />
          <Bar dataKey="value" radius={[16, 16, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={overviewColors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ClassificationPieChart(props: ClassificationChartProps) {
  const data = [
    { name: "Necessários", value: props.necessary },
    { name: "Menos necessários", value: props.optional },
    { name: "Lazer", value: props.leisure },
    { name: "Investimentos", value: props.investment }
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return <div className="flex h-72 items-center justify-center text-[13px] text-slate-400">Sem gastos classificados neste mês.</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_0.75fr]">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.06)" }}
              content={<ChartTooltip />}
            />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={92} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={classificationColors[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: classificationColors[index] }} />
              <span className="text-[13px] text-white">{entry.name}</span>
            </div>
            <span className="text-[13px] font-semibold text-white">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
