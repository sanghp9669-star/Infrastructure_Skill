import React, { useState } from 'react';
import { ArrowDownUp, Check, Layers, AlertTriangle, TrendingUp, Sparkles, X } from 'lucide-react';

export type SortStrategy =
  | 'enterprise_stack'
  | 'domain_az'
  | 'skill_az'
  | 'score_desc'
  | 'score_asc'
  | 'risk_spof_first';

interface SortOrganizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySort: (strategy: SortStrategy) => void;
}

export const SortOrganizeModal: React.FC<SortOrganizeModalProps> = ({
  isOpen,
  onClose,
  onApplySort
}) => {
  const [strategy, setStrategy] = useState<SortStrategy>('enterprise_stack');

  if (!isOpen) return null;

  const handleApply = () => {
    onApplySort(strategy);
    onClose();
  };

  const options: {
    id: SortStrategy;
    title: string;
    description: string;
    badge: string;
    badgeColor: string;
  }[] = [
    {
      id: 'enterprise_stack',
      title: 'Khung Kiến Trúc Hạ Tầng Chuẩn (Enterprise Stack Order)',
      description: 'Sắp xếp logic từ Phần Cứng/DC -> Mạng/Wireless -> Lưu Trữ -> Ảo Hóa -> Hệ Điều Hành -> Container/Cloud -> Cơ Sở Dữ Liệu -> Giám Sát -> Bảo Mật -> M365/UC -> DevOps -> AI',
      badge: 'Khuyên Dùng',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 'risk_spof_first',
      title: 'Ưu Tiên Rủi Ro & Lỗ Hổng Kỹ Năng (SPOF Priority)',
      description: 'Đưa tất cả các kỹ năng thiếu Backup hoặc chỉ có 1 người phụ trách lên đầu danh sách để lãnh đạo ưu tiên đào tạo và chuyển giao',
      badge: 'Quản Trị Rủi Ro',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'domain_az',
      title: 'Theo Bảng Chữ Cái Phân Khúc Domain (A - Z)',
      description: 'Nhóm các domain theo thứ tự bảng chữ cái tiếng Anh chuẩn hóa để tra cứu nhanh',
      badge: 'Tra Cứu',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    {
      id: 'score_desc',
      title: 'Theo Điểm Năng Lực (Từ Thế Mạnh Cao Nhất Xuống Thấp)',
      description: 'Đưa các kỹ năng có điểm trung bình cao nhất (L2: Đã Lab thành công) lên đầu nhằm làm nổi bật thế mạnh cạnh tranh của đội ngũ',
      badge: 'Đánh Giá Năng Lực',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'score_asc',
      title: 'Theo Điểm Năng Lực (Kỹ Năng Cần Cải Thiện Nhất Lên Đầu)',
      description: 'Đưa các kỹ năng L0/L1 còn yếu lên đầu để lập kế hoạch đào tạo (Training Roadmap)',
      badge: 'Đào Tạo',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 'skill_az',
      title: 'Theo Tên Kỹ Năng Công Nghệ (A - Z)',
      description: 'Sắp xếp danh mục 100+ công nghệ theo bảng chữ cái từ A đến Z',
      badge: 'Danh Mục',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ArrowDownUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Sắp Xếp & Tổ Chức Danh Mục Kỹ Năng Hạ Tầng
              </h3>
              <p className="text-[11px] text-slate-500">
                Chọn phương thức sắp xếp ma trận kỹ năng trên web và file Excel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-2.5 overflow-y-auto max-h-[60vh] text-xs">
          {options.map(opt => {
            const isSelected = strategy === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setStrategy(opt.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-2xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-3" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="font-bold text-slate-900 text-xs">
                      {opt.title}
                    </strong>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${opt.badgeColor}`}>
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            Áp Dụng Sắp Xếp Ma Trận
          </button>
        </div>
      </div>
    </div>
  );
};
