import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SkillCharts({ skillTrend }: { skillTrend: any[] }) {
  if (!skillTrend || skillTrend.length === 0) return null;

  const skillKey = Object.keys(skillTrend[0]).find((k) => k !== "date");

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "200px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={skillTrend}
          margin={{ top: 5, right: 5, left: -35, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9 }}
            tickFormatter={(str) => {
              const d = new Date(str);
              return d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year:"2-digit"
              });
            }}
            minTickGap={18}
          />
          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          {skillKey && (
            <Line
              type="monotone"
              dataKey={skillKey}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
