import { CamelToSnakeCaseObject } from '../cases';

/** CPU 情報 (生) */
export type RawCpuInfo = {
  modelName   : string;
  total       : number;
  idle        : number;
  usagePercent: number;
};

/** CPU 情報 (整形済) */
export type CpuInfo = {
  modelName   : string;
  usagePercent: string;
};

export type CpuInfoApi = CamelToSnakeCaseObject<CpuInfo>;

/** メモリ情報 (整形済) */
export type RamInfo = {
  freeGb      : string;
  totalGb     : string;
  usagePercent: string;
};

export type RamInfoApi = CamelToSnakeCaseObject<RamInfo>;

/** ディスク情報 (整形済) */
export type DiskInfo = {
  freeGb      : string;
  totalGb     : string;
  usagePercent: string;
};

export type DiskInfoApi = CamelToSnakeCaseObject<DiskInfo>;

/** サーバメトリクス */
export type ServerMetrics = {
  cpu : CpuInfo;
  ram : RamInfo;
  disk: DiskInfo;
};

export type ServerMetricsApi = CamelToSnakeCaseObject<ServerMetrics>;
