import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaCampground,
  FaExclamationTriangle,
  FaHospital,
  FaMapMarkerAlt,
  FaSearch,
  FaShieldAlt,
  FaTint,
  FaUniversity,
  FaWarehouse,
} from "react-icons/fa";
import { AdminButton } from "@/components/ui/admin/AdminUi";
import Modal from "@/components/ui/common/Modal";
import GisBoundaryMap from "@/components/admin/GisMap";
import { hazardTypeLabel, safePointTypeLabel } from "@/contants/mapPointLables";
import {
  createHazardReport,
  createSafePoint,
  createWarehouse,
} from "@/services/dispatch";
import type { HazardType, SafePointType } from "@/types/mapPoint";

// ---------- LocationIQ ----------
interface LocationIQResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

const LOCATION_IQ_URL = import.meta.env.VITE_LOCATION_IQ_URL as string | undefined;
const LOCATION_IQ_KEY = import.meta.env.VITE_LOCATION_IQ_KEY as string | undefined;

// Reverse geocode via LocationIQ
const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  if (!LOCATION_IQ_KEY) return "";
  try {
    const res = await fetch(
      `https://us1.locationiq.com/v1/reverse?key=${LOCATION_IQ_KEY}&lat=${lat}&lon=${lon}&format=json&accept-language=vi`,
    );
    if (res.ok) {
      const data = await res.json();
      return data.display_name || "";
    }
  } catch { /* ignore */ }
  return "";
};

// ---------- Props ----------
interface CreateStrategicPointModalProps {
  open: boolean;
  onClose: () => void;
}

type PointCategory = "SAFE_ZONE" | "WARE_HOUSE" | "HAZARD";

// Default center: Ho Chi Minh City
const DEFAULT_CENTER: [number, number] = [10.8231, 106.6297];

// ---------- Component ----------
export default function CreateStrategicPointModal({
  open,
  onClose,
}: CreateStrategicPointModalProps) {
  const queryClient = useQueryClient();

  // Steps
  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState<PointCategory>("SAFE_ZONE");

  // Map / location
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Safe Zone fields
  const [safeName, setSafeName] = useState("");
  const [safePointType, setSafePointType] = useState<SafePointType>("EVACUATION_CENTER");
  const [contactPhone, setContactPhone] = useState("");

  // Warehouse fields
  const [warehouseName, setWarehouseName] = useState("");
  const [managerPhone, setManagerPhone] = useState("");

  // Hazard fields
  const [hazardType, setHazardType] = useState<HazardType>("FLOOD_DEEP");
  const [description, setDescription] = useState("");
  const [hazardImages, setHazardImages] = useState<File[]>([]);

  // Address search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationIQResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Error
  const [formError, setFormError] = useState("");

  // Reset on open/close
  useEffect(() => {
    if (!open) {
      setStep(1);
      setCategory("SAFE_ZONE");
      setAddress("");
      setLatitude("");
      setLongitude("");
      setMapCenter(DEFAULT_CENTER);
      setSafeName("");
      setSafePointType("EVACUATION_CENTER");
      setContactPhone("");
      setWarehouseName("");
      setManagerPhone("");
      setHazardType("FLOOD_DEEP");
      setDescription("");
      setHazardImages([]);
      setSearchQuery("");
      setSearchResults([]);
      setFormError("");
    }
  }, [open]);

  // Click outside dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // LocationIQ autocomplete search
  const searchAddress = useCallback((q: string) => {
    if (!LOCATION_IQ_URL || !LOCATION_IQ_KEY || q.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = `${LOCATION_IQ_URL}${LOCATION_IQ_KEY}&q=${encodeURIComponent(q)}&limit=5&countrycodes=vn&accept-language=vi`;
        const res = await fetch(url);
        if (res.ok) {
          const data: LocationIQResult[] = await res.json();
          setSearchResults(data);
          setShowDropdown(data.length > 0);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  // Select from autocomplete
  const handleSelectAddress = (result: LocationIQResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setAddress(result.display_name);
    setSearchQuery(result.display_name);
    setLatitude(lat);
    setLongitude(lng);
    setMapCenter([lat, lng]);
    setShowDropdown(false);
  };

  // Click on map → reverse geocode
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setMapCenter([lat, lng]);
    setIsReverseGeocoding(true);
    const resolved = await reverseGeocode(lat, lng);
    setAddress(resolved);
    setSearchQuery(resolved);
    setIsReverseGeocoding(false);
  }, []);

  // Create mutations
  const warehouseMutation = useMutation({
    mutationFn: () =>
      createWarehouse({
        name: warehouseName,
        managerPhone: managerPhone || undefined,
        mapPoint: { address, latitude: latitude as number, longitude: longitude as number },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategic-points"] });
      toast.success("Tạo kho cứu trợ thành công!");
      onClose();
    },
    onError: (err: Error) => setFormError(err.message || "Tạo kho thất bại"),
  });

  const safePointMutation = useMutation({
    mutationFn: () =>
      createSafePoint({
        name: safeName,
        safePointType,
        contactPhone: contactPhone || undefined,
        mapPoint: { address, latitude: latitude as number, longitude: longitude as number },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategic-points"] });
      toast.success("Tạo điểm an toàn thành công!");
      onClose();
    },
    onError: (err: Error) => setFormError(err.message || "Tạo điểm an toàn thất bại"),
  });

  const hazardMutation = useMutation({
    mutationFn: () =>
      createHazardReport(
        {
          hazardType,
          description: description || undefined,
          address,
          latitude: latitude as number,
          longitude: longitude as number,
        },
        hazardImages.length > 0 ? hazardImages : undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategic-points"] });
      toast.success("Tạo báo cáo hiểm họa thành công!");
      onClose();
    },
    onError: (err: Error) => setFormError(err.message || "Tạo báo cáo hiểm họa thất bại"),
  });

  const isSubmitting =
    warehouseMutation.isPending || safePointMutation.isPending || hazardMutation.isPending;

  const handleSubmit = () => {
    setFormError("");
    if (!address.trim()) { setFormError("Vui lòng chọn vị trí trên bản đồ hoặc tìm kiếm địa chỉ"); return; }
    if (latitude === "" || longitude === "") { setFormError("Vui lòng chọn vị trí trên bản đồ"); return; }

    if (category === "WARE_HOUSE") {
      if (!warehouseName.trim()) { setFormError("Vui lòng nhập tên kho cứu trợ"); return; }
      warehouseMutation.mutate();
    } else if (category === "SAFE_ZONE") {
      if (!safeName.trim()) { setFormError("Vui lòng nhập tên điểm an toàn"); return; }
      safePointMutation.mutate();
    } else {
      hazardMutation.mutate();
    }
  };

  const categories: { value: PointCategory; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      value: "SAFE_ZONE",
      label: "Điểm an toàn",
      desc: "Trung tâm sơ tán, trạm y tế, trại tạm, trạm cấp nước",
      icon: <FaShieldAlt size={22} />,
      color: "border-emerald-500 bg-emerald-50 text-emerald-700",
    },
    {
      value: "WARE_HOUSE",
      label: "Kho cứu trợ",
      desc: "Kho lưu trữ vật tư, trang thiết bị cứu trợ",
      icon: <FaWarehouse size={22} />,
      color: "border-cyan-500 bg-cyan-50 text-cyan-700",
    },
    {
      value: "HAZARD",
      label: "Điểm nguy hiểm",
      desc: "Cây đổ, sạt lở, ngập sâu, đứt đường điện",
      icon: <FaExclamationTriangle size={22} />,
      color: "border-amber-500 bg-amber-50 text-amber-700",
    },
  ];

  const hasPin = latitude !== "" && longitude !== "";

  // ---------- Render ----------
  return (
    <Modal open={open} title="Tạo điểm chiến lược mới" size="2xl" onClose={onClose}>
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-500">
            Chọn loại điểm chiến lược bạn muốn tạo:
          </p>

          <div className="grid gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-left transition-all hover:shadow-md ${
                  category === cat.value
                    ? `${cat.color} shadow-sm ring-1 ring-inset ring-black/5`
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                  category === cat.value ? "bg-white/80" : "bg-slate-100"
                }`}>
                  {cat.icon}
                </div>
                <div>
                  <span className="font-semibold">{cat.label}</span>
                  <p className="mt-0.5 text-xs opacity-70">{cat.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <AdminButton variant="primary" onClick={() => setStep(2)}>
              Tiếp tục
            </AdminButton>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          {/* Back button */}
          <button
            type="button"
            onClick={() => { setStep(1); setFormError(""); }}
            className="mb-1 inline-flex items-center gap-1 self-start text-xs font-semibold text-cyan-700 hover:underline"
          >
            ← Chọn lại loại điểm
          </button>

          {/* Address search */}
          <div ref={dropdownRef} className="relative">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Tìm kiếm địa chỉ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchAddress(e.target.value);
                }}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                placeholder="Nhập địa chỉ để tìm kiếm..."
                className="h-9 w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
              />
              {(isSearching || isReverseGeocoding) && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
                </div>
              )}
            </div>

            {showDropdown && searchResults.length > 0 && (
              <ul className="absolute z-[1000] mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                {searchResults.map((r) => (
                  <li key={r.place_id}>
                    <button
                      type="button"
                      onClick={() => handleSelectAddress(r)}
                      className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-cyan-50"
                    >
                      <FaMapMarkerAlt className="mt-0.5 shrink-0 text-cyan-600" size={12} />
                      <span className="text-slate-700 line-clamp-2">{r.display_name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Interactive Map */}
          <GisBoundaryMap
            pinPosition={hasPin ? [latitude as number, longitude as number] : null}
            pinType={category}
            flyToCenter={mapCenter}
            onMapClick={handleMapClick}
            height={280}
            hideHeader={true}
            showCoordinateBadge={true}
            hintText={
              hasPin ? (
                <span>
                  <strong className="text-slate-700">Đã ghim vị trí.</strong>{" "}
                  Nhấp vào bản đồ để đổi vị trí hoặc tìm kiếm địa chỉ ở trên.
                </span>
              ) : (
                <span>Nhấp vào bản đồ để chọn vị trí hoặc tìm kiếm địa chỉ ở trên.</span>
              )
            }
          />

          {/* ===== Category-specific fields ===== */}
          {category === "SAFE_ZONE" && (
            <>
              <hr className="border-slate-100" />
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <FaShieldAlt size={12} />
                <span>Thông tin điểm an toàn</span>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Tên điểm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={safeName}
                  onChange={(e) => setSafeName(e.target.value)}
                  placeholder="VD: Trung tâm sơ tán Quận 9"
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Loại điểm an toàn <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(safePointTypeLabel) as [SafePointType, string][]).map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSafePointType(v)}
                      className={`flex items-center gap-2.5 rounded-lg border-2 px-3 py-2 text-left text-sm transition-all ${
                        safePointType === v
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-inset ring-emerald-500/20"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                        safePointType === v ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                      }`}>
                        {getSafePointIcon(v)}
                      </span>
                      <span className="font-medium leading-tight">{l}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Số điện thoại liên hệ
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="VD: 0901234567"
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                />
              </div>
            </>
          )}

          {category === "WARE_HOUSE" && (
            <>
              <hr className="border-slate-100" />
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
                <FaWarehouse size={12} />
                <span>Thông tin kho cứu trợ</span>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Tên kho <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  placeholder="VD: Kho cứu trợ trung tâm"
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  SĐT quản lý kho
                </label>
                <input
                  type="tel"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  placeholder="VD: 0901234567"
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                />
              </div>
            </>
          )}

          {category === "HAZARD" && (
            <>
              <hr className="border-slate-100" />
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
                <FaExclamationTriangle size={12} />
                <span>Thông tin hiểm họa</span>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Loại hiểm họa <span className="text-rose-500">*</span>
                </label>
                <select
                  value={hazardType}
                  onChange={(e) => setHazardType(e.target.value as HazardType)}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600"
                >
                  {(Object.entries(hazardTypeLabel) as [HazardType, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Mô tả tình huống
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết tình hình hiểm họa..."
                  rows={3}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 resize-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Hình ảnh hiện trường (tối đa 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files).slice(0, 5) : [];
                    setHazardImages(files);
                  }}
                  className="w-full text-sm text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-cyan-700 hover:file:bg-cyan-100"
                />
                {hazardImages.length > 0 && (
                  <p className="mt-1 text-xs text-slate-400">
                    Đã chọn {hazardImages.length} ảnh
                  </p>
                )}
              </div>
            </>
          )}

          {/* Error */}
          {formError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {formError}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <AdminButton variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang tạo..." : "Tạo điểm chiến lược"}
            </AdminButton>
          </div>
        </div>
      )}
    </Modal>
  );
}

function getSafePointIcon(type: SafePointType): React.ReactNode {
  switch (type) {
    case "EVACUATION_CENTER": return <FaUniversity size={14} />;
    case "MEDICAL_STATION": return <FaHospital size={14} />;
    case "TEMPORARY_CAMP": return <FaCampground size={14} />;
    case "WATER_STATION": return <FaTint size={14} />;
    default: return null;
  }
}
