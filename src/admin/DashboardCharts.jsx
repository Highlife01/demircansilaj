import React, { useMemo } from 'react';
import { BarChart3, PieChart, MapPin } from 'lucide-react';

const MONTH_LABELS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

function toDate(ts) {
  return ts?.toDate ? ts.toDate() : null;
}

// Son 6 ayın sipariş adedi ve cirosunu hesaplar.
function useMonthly(orders) {
  return useMemo(() => {
    const now = new Date();
    const buckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()], count: 0, revenue: 0 });
    }
    const idx = Object.fromEntries(buckets.map((b, i) => [b.key, i]));
    orders.forEach((o) => {
      const d = toDate(o.createdAt);
      if (!d) return;
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (k in idx) {
        buckets[idx[k]].count += 1;
        if (o.status !== 'cancelled') buckets[idx[k]].revenue += o.totalPrice || 0;
      }
    });
    return buckets;
  }, [orders]);
}

function MonthlyChart({ orders }) {
  const data = useMonthly(orders);
  const maxCount = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-emerald-400" />
        <h3 className="font-bold text-white">Son 6 Ay — Sipariş Trendi</h3>
      </div>
      <div className="flex items-end justify-between gap-3 h-40">
        {data.map((d) => (
          <div key={d.key} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="text-xs font-bold text-gray-300 mb-1">{d.count}</span>
            <div
              className="w-full max-w-[42px] rounded-t-lg bg-gradient-to-t from-emerald-500 to-cyan-400 transition-all"
              style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count ? '6px' : '2px' }}
              title={`${d.count} sipariş • ${d.revenue.toLocaleString('tr-TR')} ₺`}
            />
            <span className="text-[11px] font-semibold text-gray-500 mt-2">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs">
        <span className="text-gray-500 font-semibold uppercase tracking-wider">Son 6 ay cirosu</span>
        <span className="font-extrabold text-emerald-300">
          {data.reduce((s, d) => s + d.revenue, 0).toLocaleString('tr-TR')} ₺
        </span>
      </div>
    </div>
  );
}

function ProductBreakdown({ orders }) {
  const rows = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const key = o.productName || o.productType || 'Diğer';
      map[key] = (map[key] || 0) + 1;
    });
    const total = orders.length || 1;
    return Object.entries(map)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="h-5 w-5 text-fuchsia-400" />
        <h3 className="font-bold text-white">Ürün Dağılımı</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">Henüz veri yok.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.name}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-300 font-medium truncate pr-2">{r.name}</span>
                <span className="text-gray-500 font-semibold shrink-0">{r.count} • %{r.pct}</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-400 rounded-full" style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TopProvinces({ orders }) {
  const rows = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const loc = (o.location || '').trim();
      if (!loc) return;
      const key = loc.split(/[\/,-]/)[0].trim() || loc;
      map[key] = (map[key] || 0) + 1;
    });
    const max = Math.max(1, ...Object.values(map));
    return Object.entries(map)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / max) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [orders]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="h-5 w-5 text-amber-400" />
        <h3 className="font-bold text-white">En Çok Talep — İl/Bölge</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">Henüz konum verisi yok.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.name}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-300 font-medium capitalize truncate pr-2">{r.name}</span>
                <span className="text-gray-500 font-semibold shrink-0">{r.count}</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardCharts({ orders }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      <MonthlyChart orders={orders} />
      <ProductBreakdown orders={orders} />
      <TopProvinces orders={orders} />
    </div>
  );
}
