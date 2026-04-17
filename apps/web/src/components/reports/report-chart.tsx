"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface ChartEntry {
  name: string;
  Sales: number;
  Purchases: number;
}

interface ReportChartProps {
  data: ChartEntry[];
  title: string;
  description: string;
}

export function ReportChart({ data, title, description }: ReportChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {data.length > 0 ? (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                barCategoryGap="25%"
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(v: unknown, name: unknown) => [`₹${Number(v).toFixed(2)}`, String(name)]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Purchases" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground bg-muted/20 rounded-md text-sm">
            No data for this period.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
