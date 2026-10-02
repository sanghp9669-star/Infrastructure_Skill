import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Cell, 
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { CompetencyLevel, SkillItem, TeamMember } from '../types/skills';
import { COMPETENCY_DEFINITIONS } from '../data/initialData';
import { 
  BarChart3, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Users, 
  Zap, 
  Target, 
  Sparkles,
  ArrowDownUp,
  Sliders,
  Flame,
  ShieldCheck,
  Award
} from 'lucide-react';

interface PerformanceMetricsDashboardProps {
  skills: SkillItem[];
  members: TeamMember[];
  onSelectDomainFilter?: (domain: string) => void;
}

export const PerformanceMetricsDashboard: React.FC<PerformanceMetricsDashboardProps> = ({
  skills,
  members,
  onSelectDomainFilter
}) => {
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [displayMode, setDisplayMode] = useState<'percentage' | 'count'>('percentage');
  const [sortBy, setSortBy] = useState<'deficit_desc' | 'l2_desc' | 'alphabetical'>('deficit_desc');
  const [minL2Threshold, setMinL2Threshold] = useState<number>(60); // 60% benchmark

  // 1. Process Domain Level Distribution across all 14-15 domains
  const domainData = useMemo(() => {
    const domains = Array.from(new Set(skills.map(s => s.domain))).sort();

    const results = domains.map(domain => {
      const domainSkills = skills.filter(s => s.domain === domain);
      const totalDomainSkills = domainSkills.length;
      
      let countL0 = 0;
      let countL1 = 0;
      let countL2 = 0;
      let totalRatings = 0;

      domainSkills.forEach(s => {
        members.forEach(m => {
          if (selectedMember === 'all' || selectedMember === m.name) {
            const lvl = s.ratings[m.name] || 'L0';
            if (lvl === 'L2') countL2++;
            else if (lvl === 'L1') countL1++;
            else countL0++;
            totalRatings++;
          }
        });
      });

      const pctL0 = totalRatings > 0 ? Math.round((countL0 / totalRatings) * 100) : 0;
      const pctL1 = totalRatings > 0 ? Math.round((countL1 / totalRatings) * 100) : 0;
      const pctL2 = totalRatings > 0 ? Math.round((countL2 / totalRatings) * 100) : 0;

      // Deficit Gap: shortfall to reach threshold
      const gapToTarget = Math.max(0, minL2Threshold - pctL2);

      // Average score (0 to 2.0)
      const avgScore = totalRatings > 0 ? Number(((countL1 * 1 + countL2 * 2) / totalRatings).toFixed(2)) : 0;

      // Short domain display name for chart labels
      const shortDomain = domain.length > 22 ? domain.slice(0, 20) + '...' : domain;

      return {
        domain,
        shortDomain,
        totalSkills: totalDomainSkills,
        totalRatings,
        countL0,
        countL1,
        countL2,
        pctL0,
        pctL1,
        pctL2,
        avgScore,
        gapToTarget,
        isDeficit: pctL2 < minL2Threshold,
        // Radar chart score normalized (0-100)
        readinessScore: pctL2,
        benchmark: minL2Threshold
      };
    });

    // Sorting
    if (sortBy === 'deficit_desc') {
      return results.sort((a, b) => b.gapToTarget - a.gapToTarget || a.pctL2 - b.pctL2);
    }
    if (sortBy === 'l2_desc') {
      return results.sort((a, b) => b.pctL2 - a.pctL2);
    }
    return results.sort((a, b) => a.domain.localeCompare(b.domain));
  }, [skills, members, selectedMember, sortBy, minL2Threshold]);

  // Overall Global KPIs
  const globalKPIs = useMemo(() => {
    let totalL0 = 0;
    let totalL1 = 0;
    let totalL2 = 0;
    let totalRatingsCount = 0;

    domainData.forEach(d => {
      totalL0 += d.countL0;
      totalL1 += d.countL1;
      totalL2 += d.countL2;
      totalRatingsCount += d.totalRatings;
    });

    const globalL2Pct = totalRatingsCount > 0 ? Math.round((totalL2 / totalRatingsCount) * 100) : 0;
    const globalL1Pct = totalRatingsCount > 0 ? Math.round((totalL1 / totalRatingsCount) * 100) : 0;
    const globalL0Pct = totalRatingsCount > 0 ? Math.round((totalL0 / totalRatingsCount) * 100) : 0;

    const deficitDomainsCount = domainData.filter(d => d.isDeficit).length;
    const masteryDomainsCount = domainData.filter(d => d.pctL2 >= 75).length;

    return {
      totalL0,
      totalL1,
      totalL2,
      totalRatingsCount,
      globalL2Pct,
      globalL1Pct,
      globalL0Pct,
      deficitDomainsCount,
      masteryDomainsCount,
      totalDomains: domainData.length
    };
  }, [domainData]);

  // Custom Tooltip for Stacked Bar Chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-2 max-w-xs animate-in fade-in duration-100">
          <div className="border-b border-slate-700 pb-1.5">
            <span className="font-bold text-slate-200 block text-xs leading-snug">{data.domain}</span>
            <span className="text-[10px] text-slate-400">
              {data.totalSkills} Kỹ năng · {data.totalRatings} lượt đánh giá
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                L2 (Đã làm thực tế):
              </span>
              <span>{data.pctL2}% ({data.countL2} lượt)</span>
            </div>

            <div className="flex items-center justify-between text-orange-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                L1 (Đã biết / Lab dở dang):
              </span>
              <span>{data.pctL1}% ({data.countL1} lượt)</span>
            </div>

            <div className="flex items-center justify-between text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                L0 (Chưa biết):
              </span>
              <span>{data.pctL0}% ({data.countL0} lượt)</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Điểm TB Domain:</span>
            <span className="font-mono font-bold text-indigo-300">{data.avgScore} / 2.0</span>
          </div>

          {data.isDeficit && (
            <div className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-1 rounded border border-amber-800/80 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Thiếu {data.gapToTarget}% để đạt chuẩn {minL2Threshold}%</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Hiệu Suất & Phân Phối Năng Lực (Performance Metrics Dashboard)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Phân Bổ L0 - L2 Trên 14 Nhóm Kỹ Năng
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Trực quan hóa cấu trúc năng lực thực chiến, đo lường tỷ lệ hoàn thành Lab và phát hiện ngay các lỗ hổng kỹ năng (Competency Gaps).
              </p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Member selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Nhân sự:</span>
              <select
                value={selectedMember}
                onChange={e => setSelectedMember(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-hidden focus:border-indigo-500"
              >
                <option value="all">Toàn Bộ Đội Ngũ ({members.length} người)</option>
                {members.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Mode: Percentage vs Count */}
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setDisplayMode('percentage')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  displayMode === 'percentage' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Tỷ Lệ % (L0–L2)
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('count')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  displayMode === 'count' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Số Lượng Đánh Giá
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-hidden"
              >
                <option value="deficit_desc">Lỗ Hổng Thiếu Hụt Nhiều Nhất</option>
                <option value="l2_desc">Tỷ Lệ Thực Chiến L2 Cao Nhất</option>
                <option value="alphabetical">Tên Nhóm Kỹ Năng A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPI High-Level Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Tỷ Lệ Sẵn Sàng Thực Chiến (L2)
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-2xl font-black tabular-nums ${
                globalKPIs.globalL2Pct >= 60 ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {globalKPIs.globalL2Pct}%
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                ({globalKPIs.totalL2} lượt)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Đã biết & hoàn thành Lab
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Đang Tiếp Cận / Lab Dở Dang (L1)
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-orange-600 tabular-nums">
                {globalKPIs.globalL1Pct}%
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                ({globalKPIs.totalL1} lượt)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Có lý thuyết, đang thực hành
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Nhóm Cần Bồi Dưỡng Cấp Thiết
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-rose-600 tabular-nums">
                {globalKPIs.deficitDomainsCount}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                / {globalKPIs.totalDomains} Domains
              </span>
            </div>
            <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
              Dưới chuẩn {minL2Threshold}% L2
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Nhóm Năng Lực Vững Mạnh (≥75%)
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-indigo-700 tabular-nums">
                {globalKPIs.masteryDomainsCount}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                / {globalKPIs.totalDomains} Domains
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
              Tự chủ triển khai độc lập
            </span>
          </div>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual 1: Full 14-Domain Stacked Bar Chart (8 Columns on desktop) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Biểu Đồ Phân Phối Cấp Độ Năng Lực L0 - L1 - L2 Trên 14 Nhóm Kỹ Năng
                </h4>
              </div>

              {/* Legend preview */}
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded bg-slate-400" />
                  L0 (Chưa biết)
                </span>
                <span className="flex items-center gap-1 text-orange-600">
                  <span className="w-2.5 h-2.5 rounded bg-orange-500" />
                  L1 (Đã biết)
                </span>
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
                  L2 (Lab thành công)
                </span>
              </div>
            </div>

            {/* Recharts Stacked Horizontal Bar Chart */}
            <div className="w-full h-[520px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={domainData}
                  margin={{ top: 10, right: 30, left: 140, bottom: 20 }}
                  barCategoryGap={6}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis
                    type="number"
                    domain={displayMode === 'percentage' ? [0, 100] : [0, 'auto']}
                    tickFormatter={val => (displayMode === 'percentage' ? `${val}%` : val)}
                    stroke="#64748B"
                    fontSize={11}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortDomain"
                    stroke="#334155"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    width={135}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  
                  {displayMode === 'percentage' && (
                    <ReferenceLine
                      x={minL2Threshold}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      label={{
                        value: `Chuẩn: ${minL2Threshold}%`,
                        position: 'insideTopRight',
                        fill: '#EF4444',
                        fontSize: 10,
                        fontWeight: 'bold'
                      }}
                    />
                  )}

                  {displayMode === 'percentage' ? (
                    <>
                      <Bar
                        dataKey="pctL2"
                        name="L2 · Lab thành công"
                        stackId="a"
                        fill="#059669"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="pctL1"
                        name="L1 · Đã biết / Lab dở dang"
                        stackId="a"
                        fill="#F97316"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="pctL0"
                        name="L0 · Chưa biết"
                        stackId="a"
                        fill="#94A3B8"
                        radius={[0, 4, 4, 0]}
                      />
                    </>
                  ) : (
                    <>
                      <Bar
                        dataKey="countL2"
                        name="L2 · Lab thành công"
                        stackId="a"
                        fill="#059669"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="countL1"
                        name="L1 · Đã biết / Lab dở dang"
                        stackId="a"
                        fill="#F97316"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="countL0"
                        name="L0 · Chưa biết"
                        stackId="a"
                        fill="#94A3B8"
                        radius={[0, 4, 4, 0]}
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              💡 <em>Đường nét đứt màu đỏ ({minL2Threshold}%) là ngưỡng mục tiêu tối thiểu cho năng lực tự chủ vận hành hạ tầng.</em>
            </span>
            <span className="font-semibold text-slate-700">
              Tổng cộng 14–15 phân khúc kỹ thuật
            </span>
          </div>
        </div>

        {/* Visual 2: Competency Gap Radar & Deficit Shortfall (4 Columns on desktop) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Radar Chart for 360° Readiness Overview */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-xs">
                  Radar Đo Lường Độ Phủ Năng Lực 360°
                </h4>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                14 Domains
              </span>
            </div>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={domainData.slice(0, 10)}>
                  <PolarGrid stroke="#CBD5E1" />
                  <PolarAngleAxis
                    dataKey="shortDomain"
                    stroke="#475569"
                    fontSize={9}
                    tick={{ fill: '#334155', fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    stroke="#94A3B8"
                    fontSize={9}
                  />
                  <Radar
                    name="Tỷ lệ L2 Thực Tế (%)"
                    dataKey="readinessScore"
                    stroke="#4F46E5"
                    fill="#6366F1"
                    fillOpacity={0.45}
                  />
                  <Radar
                    name="Mục Tiêu Chuẩn (%)"
                    dataKey="benchmark"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.08}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Competency Deficit Gaps List */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-slate-900 text-xs">
                  Top Lỗ Hổng Cần Đào Tạo Bổ Sung
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">
                Xếp theo độ lệch chuẩn
              </span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {domainData
                .filter(d => d.isDeficit)
                .slice(0, 6)
                .map((item, idx) => (
                  <div
                    key={item.domain}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 hover:bg-amber-50/50 hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate max-w-[180px]">
                        {idx + 1}. {item.domain}
                      </span>
                      <span className="font-mono font-bold text-rose-600 text-[11px] shrink-0">
                        Thiếu {item.gapToTarget}%
                      </span>
                    </div>

                    {/* Progress representation */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full transition-all"
                          style={{ width: `${item.pctL2}%` }}
                        />
                        <div
                          className="bg-orange-400 h-full transition-all"
                          style={{ width: `${item.pctL1}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Đạt {item.pctL2}% L2</span>
                        <span>Mục tiêu {minL2Threshold}%</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
