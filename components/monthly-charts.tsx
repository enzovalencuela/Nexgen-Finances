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

export function OverviewBarChart(props: OverviewChartProps) {
  const data = [
    { name: "Entradas", value: props.entries },
    { name: "A pagar", value: props.payables },
    { name: "A receber", value: props.receivables },
    { name: "Contas", value: props.expenses },
    { name: "Sobra", value: props.leftover }
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
          <Tooltip
            contentStyle={{
              background: "#081120",
              border: "1px solid rgba(148,163,184,0.16)",
              borderRadius: 18,
              color: "#fff"
            }}
            formatter={tooltipFormatter}
          />
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
    { name: "Necessarios", value: props.necessary },
    { name: "Nao tao necessarios", value: props.optional },
    { name: "Lazer", value: props.leisure },
    { name: "Investimentos", value: props.investment }
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return <div className="flex h-72 items-center justify-center text-sm text-slate-400">Sem gastos classificados neste mes.</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_0.75fr]">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                background: "#081120",
                border: "1px solid rgba(148,163,184,0.16)",
                borderRadius: 18,
                color: "#fff"
              }}
              formatter={tooltipFormatter}
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
              <span className="text-sm text-white">{entry.name}</span>
            </div>
            <span className="text-sm font-semibold text-white">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
