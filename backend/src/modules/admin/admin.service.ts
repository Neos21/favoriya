import * as fs from 'node:fs/promises';
import * as os from 'node:os';

import { Injectable } from '@nestjs/common';

import type { Result } from '../../common/types/result';
import type { CpuInfo, DiskInfo, RamInfo, RawCpuInfo, ServerMetrics } from '../../common/types/admin/server-metrics';

/** Admin Service */
@Injectable()
export class AdminService {
  /** サーバメトリクスを取得する */
  public async getServerMetrics(): Promise<Result<ServerMetrics>> {
    const cpu  = await this.getCpuInfo();
    const ram  = this.getRamInfo();
    const disk = await this.getDiskInfo();
    
    const result = { cpu, ram, disk };
    return { result };
  }
  
  /** CPU 情報を取得する */
  private async getCpuInfo(): Promise<CpuInfo> {
    const rawCpuInfo: RawCpuInfo = await new Promise(resolve => {
      process.nextTick(() => {
        const cpus = os.cpus();
        const modelName = cpus[0].model;
        const sum = cpus.reduce((accumulator, currentCpu) => {
          accumulator.idle += currentCpu.times.idle;
          accumulator.irq  += currentCpu.times.irq;
          accumulator.nice += currentCpu.times.nice;
          accumulator.sys  += currentCpu.times.sys;
          accumulator.user += currentCpu.times.user;
          return accumulator;
        }, { idle: 0, irq: 0, nice: 0, sys: 0, user: 0 });
        const total = Object.values(sum).reduce((accumulator, time) => accumulator + time, 0);
        return resolve({ modelName, total, idle: sum.idle, usagePercent: 0 });
      });
    });
    rawCpuInfo.usagePercent = (1 - (rawCpuInfo.idle / rawCpuInfo.total)) * 100;
    
    return {
      modelName   : rawCpuInfo.modelName,
      usagePercent: rawCpuInfo.usagePercent.toFixed(2)
    };
  }
  
  /** メモリ情報を取得する */
  private getRamInfo(): RamInfo {
    const rawTotalGb      = os.totalmem() / (1024 * 1024 * 1024);
    const rawFreeGb       = os.freemem()  / (1024 * 1024 * 1024);
    const rawUsagePercent = (1 - (rawFreeGb / rawTotalGb)) * 100;
    
    return {
      totalGb     : rawTotalGb     .toFixed(2),
      freeGb      : rawFreeGb      .toFixed(2),
      usagePercent: rawUsagePercent.toFixed(2)
    };
  }
  
  /** ディスク情報を取得する */
  private async getDiskInfo(): Promise<DiskInfo> {
    const diskInfo = await fs.statfs('/');
    const rawTotalGb = (diskInfo.blocks * diskInfo.bsize) / (1024 * 1024 * 1024);
    const rawFreeGb  = (diskInfo.bfree  * diskInfo.bsize) / (1024 * 1024 * 1024);
    const rawUsagePercent = (1 - (rawFreeGb / rawTotalGb)) * 100;
    
    return {
      totalGb     : rawTotalGb     .toFixed(2),
      freeGb      : rawFreeGb      .toFixed(2),
      usagePercent: rawUsagePercent.toFixed(2)
    };
  }
}
