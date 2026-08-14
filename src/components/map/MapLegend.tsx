import { pointTypeMeta } from './mapPointMeta';

export default function MapLegend() {
  return (
    <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/50 max-w-[220px]">
      <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-3">
        Chú thích bản đồ
      </h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-4 w-4 items-center justify-center">
            <span className="absolute h-4 w-4 rounded-full border-2 border-red-500 opacity-60 animate-ping"></span>
            <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-red-500 p-[2px] shadow-sm">
              <span className="h-full w-full rounded-full border-2 border-white bg-red-500"></span>
            </span>
          </span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Khẩn cấp SOS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${pointTypeMeta.SAFE_ZONE.markerClassName} border border-white`}></span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Vùng an toàn
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${pointTypeMeta.HAZARD.markerClassName} border border-white`}></span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Khu vực nguy hiểm
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${pointTypeMeta.WARE_HOUSE.markerClassName} border border-white`}></span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Kho cứu trợ
          </span>
        </div>
      </div>
    </div>
  );
}
