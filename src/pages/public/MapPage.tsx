import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaClock, FaFilter, FaHome } from "react-icons/fa";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import RescueMap from "@/components/map/RescueMap";
import Button from "@/components/ui/common/Button";
import CheckboxOption from "@/components/ui/common/CheckboxOption";
import FieldGroup from "@/components/ui/common/FieldGroup";
import Popover from "@/components/ui/common/Popover";
import {
  emergencyLevelLabel,
  hazardTypeLabel,
  pointTypeLabel,
  rescueStatusLabel,
  safePointTypeLabel,
} from "@/contants/mapPointLables";
import { getAllMapPoints, getMapPointDetail } from "@/services/dispatch";
import type {
  EmergencyLevel,
  HazardType,
  MapPointDetailRes,
  MapPointFilterRequest,
  MapPointRes,
  PointType,
  RequestStatus,
  SafePointType,
} from "@/types/mapPoint";

const defaultPosition: [number, number] = [16.059432, 108.223547];

type FilterOption<T extends string> = {
  value: T;
  label: string;
};

type PostingTimeOption = {
  hours: number;
  label: string;
};

const createOptions = <T extends string>(labels: Record<T, string>) =>
  Object.entries(labels).map(([value, label]) => ({
    value: value as T,
    label: label as string,
  }));

const pointTypeOptions = createOptions<PointType>(pointTypeLabel);
const rescueStatusOptions = createOptions<RequestStatus>(rescueStatusLabel);
const emergencyLevelOptions =
  createOptions<EmergencyLevel>(emergencyLevelLabel);
const hazardTypeOptions = createOptions<HazardType>(hazardTypeLabel);
const safePointTypeOptions = createOptions<SafePointType>(safePointTypeLabel);
const postingTimeOptions: PostingTimeOption[] = [
  { hours: 2, label: "2h trước" },
  { hours: 5, label: "5h trước" },
  { hours: 12, label: "12h trước" },
  { hours: 24, label: "24h trước" },
  { hours: 48, label: "48h trước" },
  { hours: 72, label: "72h trước" },
];

const getSelectedFilterCount = (filter: MapPointFilterRequest) =>
  Object.values(filter).reduce(
    (count, values) => count + (Array.isArray(values) ? values.length : 0),
    0,
  );

const formatLocalDateTime = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${[
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join(":")}`;
};

const createPostingTimeRange = (hours: number) => {
  const toTime = new Date();
  const fromTime = new Date(toTime.getTime() - hours * 60 * 60 * 1000);

  return {
    fromTime: formatLocalDateTime(fromTime),
    toTime: formatLocalDateTime(toTime),
  };
};

const createFilterItems = <T extends string>({
  options,
  selectedValues,
  onToggle,
}: {
  options: FilterOption<T>[];
  selectedValues: T[];
  onToggle: (value: T) => void;
}) => {
  const selectedSet = new Set(selectedValues);

  return options.map((option) => {
    const selected = selectedSet.has(option.value);

    return (
      <CheckboxOption
        key={option.value}
        label={option.label}
        checked={selected}
        onChange={() => onToggle(option.value)}
      />
    );
  });
};

type FilterPopoverHeaderProps = {
  title: string;
  onClear: () => void;
  clearDisabled: boolean;
};

const FilterPopoverHeader = ({
  title,
  onClear,
  clearDisabled,
}: FilterPopoverHeaderProps) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <h1 className="text-base font-bold text-slate-900">{title}</h1>

    <Button
      className="h-8 bg-slate-100 px-3 text-xs text-slate-700 hover:bg-slate-200"
      onClick={onClear}
      disabled={clearDisabled}
    >
      Xóa lọc
    </Button>
  </div>
);

export default function MapPage() {
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [postingTimeFilterOpen, setPostingTimeFilterOpen] = useState(false);
  const [selectedPostingTimeHours, setSelectedPostingTimeHours] = useState<
    number | null
  >(null);
  const [mapPointFilter, setMapPointFilter] = useState<MapPointFilterRequest>(
    {},
  );
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const navigate = useNavigate();

  const { data } = useQuery<MapPointRes[]>({
    queryKey: ["mapPoints", mapPointFilter],
    queryFn: () => getAllMapPoints(mapPointFilter),
    refetchInterval: 10000,
    retry: 1,
  });

  const detailQuery = useQuery<MapPointDetailRes, Error>({
    queryKey: ["mapPointDetail", selectedPointId],
    queryFn: () => getMapPointDetail(selectedPointId!),
    enabled: !!selectedPointId,
    retry: 1,
  });

  const activeFilterCount = getSelectedFilterCount(mapPointFilter);
  const hasPostingTimeFilter =
    !!mapPointFilter.fromTime && !!mapPointFilter.toTime;

  const toggleFilterValue = (
    key: keyof MapPointFilterRequest,
    value: string,
  ) => {
    setMapPointFilter((current) => {
      const values = (current[key] ?? []) as string[];
      const nextValues = values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];

      return {
        ...current,
        [key]: nextValues.length > 0 ? nextValues : undefined,
      };
    });
  };

  const clearFilters = () => {
    setSelectedPostingTimeHours(null);
    setMapPointFilter({});
  };

  const applyPostingTimeFilter = (hours: number) => {
    const { fromTime, toTime } = createPostingTimeRange(hours);

    setSelectedPostingTimeHours(hours);
    setMapPointFilter((current) => ({
      ...current,
      fromTime,
      toTime,
    }));
  };

  const clearPostingTimeFilter = () => {
    setSelectedPostingTimeHours(null);
    setMapPointFilter((current) => {
      const nextFilter = { ...current };
      delete nextFilter.fromTime;
      delete nextFilter.toTime;
      return nextFilter;
    });
  };

  const handleLocateMe = () => {
    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      setUserLocation([coords.latitude, coords.longitude]);
    });
  };

  return (
    <div className="relative h-full w-full bg-slate-100">
      <Button
        className="absolute left-2 top-2 z-1000 gap-2 bg-secondary/50! text-primary! shadow-lg backdrop-blur-sm hover:bg-secondary/80!"
        onClick={() => navigate("/")}
      >
        <FaHome />
        <span>Quay về trang chủ</span>
      </Button>

      <div className="absolute right-2 top-2 z-1000 flex flex-col gap-3">
        <Popover
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          className="w-88 max-w-[calc(100vw-1rem)] p-0"
          horizontalOffset={-20}
          trigger={
            <Button
              className="relative h-10 w-10 bg-secondary p-0! text-white"
              onClick={() => setFilterOpen((value) => !value)}
              aria-label="Mở bộ lọc bản đồ"
            >
              <FaFilter />
              {activeFilterCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-xs font-bold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
          }
        >
          <div className="max-h-[min(70vh,34rem)] overflow-y-auto p-4">
            <FilterPopoverHeader
              title="Bộ lọc bản đồ"
              onClear={clearFilters}
              clearDisabled={activeFilterCount === 0}
            />

            <div className="space-y-4">
              <section>
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Loại điểm
                </h2>
                <FieldGroup
                  className="grid gap-2"
                  items={createFilterItems({
                    options: pointTypeOptions,
                    selectedValues: mapPointFilter.pointTypes ?? [],
                    onToggle: (value) => toggleFilterValue("pointTypes", value),
                  })}
                />
              </section>

              <section>
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Trạng thái SOS
                </h2>
                <FieldGroup
                  className="grid gap-2"
                  items={createFilterItems({
                    options: rescueStatusOptions,
                    selectedValues: mapPointFilter.rescueStatuses ?? [],
                    onToggle: (value) =>
                      toggleFilterValue("rescueStatuses", value),
                  })}
                />
              </section>

              <section>
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Mức khẩn cấp của SOS
                </h2>
                <FieldGroup
                  className="grid gap-2"
                  items={createFilterItems({
                    options: emergencyLevelOptions,
                    selectedValues: mapPointFilter.emergencyLevels ?? [],
                    onToggle: (value) =>
                      toggleFilterValue("emergencyLevels", value),
                  })}
                />
              </section>

              <section>
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Loại nguy hiểm
                </h2>
                <FieldGroup
                  className="grid gap-2"
                  items={createFilterItems({
                    options: hazardTypeOptions,
                    selectedValues: mapPointFilter.hazardTypes ?? [],
                    onToggle: (value) =>
                      toggleFilterValue("hazardTypes", value),
                  })}
                />
              </section>

              <section>
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Loại điểm an toàn
                </h2>
                <FieldGroup
                  className="grid gap-2"
                  items={createFilterItems({
                    options: safePointTypeOptions,
                    selectedValues: mapPointFilter.safePointTypes ?? [],
                    onToggle: (value) =>
                      toggleFilterValue("safePointTypes", value),
                  })}
                />
              </section>
            </div>
          </div>
        </Popover>
        <Popover
          open={postingTimeFilterOpen}
          onClose={() => setPostingTimeFilterOpen(false)}
          className="w-88 max-w-[calc(100vw-1rem)] p-4"
          horizontalOffset={-20}
          trigger={
            <Button
              className="relative h-10 w-10 bg-secondary p-0! text-white"
              onClick={() => setPostingTimeFilterOpen((value) => !value)}
              aria-label="Má»Ÿ bá»™ lá»c thá»i gian"
            >
              <FaClock />
              {hasPostingTimeFilter ? (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-danger ring-2 ring-white" />
              ) : null}
            </Button>
          }
        >
          <FilterPopoverHeader
            title="Thời gian đăng"
            onClear={clearPostingTimeFilter}
            clearDisabled={!hasPostingTimeFilter}
          />

          <div className="grid grid-cols-2 gap-2">
            {postingTimeOptions.map((option) => {
              const selected = selectedPostingTimeHours === option.hours;

              return (
                <Button
                  key={option.hours}
                  className={`h-9 border px-3 text-sm ${
                    selected
                      ? "border-secondary bg-secondary/10 text-primary"
                      : "border-slate-200 bg-white text-slate-700 hover:border-secondary/50 hover:bg-white"
                  }`}
                  onClick={() => applyPostingTimeFilter(option.hours)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </Popover>
      </div>

      <Button
        className="absolute bottom-5 right-2 z-1000 h-10 w-10 bg-white p-0! text-white! shadow-lg backdrop-blur-sm"
        onClick={handleLocateMe}
        aria-label="Lấy định vị của tôi"
      >
        <FaLocationCrosshairs color="black" />
      </Button>

      <RescueMap
        center={defaultPosition}
        points={data ?? []}
        zoom={13}
        userLocation={userLocation}
        onPointDetailRequest={setSelectedPointId}
        selectedPointDetail={detailQuery.data ?? null}
        detailLoading={detailQuery.isLoading}
        detailError={detailQuery.error}
      />
    </div>
  );
}
