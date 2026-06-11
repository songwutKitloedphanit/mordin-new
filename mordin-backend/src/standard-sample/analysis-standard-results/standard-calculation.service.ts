import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Decimal from 'decimal.js';
import { MachineTypeTypes } from 'src/laboratory/enums/machine-type.enum';
import { Repository } from 'typeorm';

import { AnalysisStandardResult } from './entities/analysis-standard-result.entity';

@Injectable()
export class StandardCalculationService {
  // Default dirt weights from QrCode entity
  private readonly DEFAULT_DIRT_WEIGHT_OM = 0.0025;
  private readonly DEFAULT_DIRT_WEIGHT_MEHLICH = 0.003;

  constructor(
    @InjectRepository(AnalysisStandardResult)
    private readonly analysisStandardResultRepo: Repository<AnalysisStandardResult>
  ) {}

  private calculatePostValue(result: AnalysisStandardResult): number {
    const machineType = result.laboratorySetting.laboratory.machineType.type;

    switch (machineType) {
      case MachineTypeTypes.RAW_VALUE:
        return this.calculateRawValue(result);

      case MachineTypeTypes.REVERSE_LINEAR:
        return this.calculateReverseLinear(result);

      case MachineTypeTypes.P_COMPLEX:
        return this.calculatePComplex(result);

      case MachineTypeTypes.EXTRACT_RATIO:
      default:
        return this.calculateExtractRatio(result);
    }
  }

  private calculateRawValue(result: AnalysisStandardResult): number {
    return result.preValue;
  }

  private calculateReverseLinear(result: AnalysisStandardResult): number {
    const { intercept, slope, extractConcentration, extractAmount } =
      result.laboratorySetting || {};

    const dirtWeightOm = this.DEFAULT_DIRT_WEIGHT_OM;
    const OMAbs = result.preValue;

    if (
      intercept === undefined ||
      slope === undefined ||
      extractConcentration === undefined ||
      extractAmount === undefined ||
      dirtWeightOm === undefined ||
      OMAbs === undefined
    ) {
      return 0;
    }

    const interceptD = new Decimal(intercept);
    const slopeD = new Decimal(slope);
    const extractConcentrationD = new Decimal(extractConcentration);
    const extractAmountD = new Decimal(extractAmount);
    const dirtWeightOmD = new Decimal(dirtWeightOm);
    const OMAbsD = new Decimal(OMAbs);

    const POXC = extractConcentrationD
      .minus(interceptD.plus(slopeD.times(OMAbsD)))
      .times(9000)
      .times(extractAmountD.div(dirtWeightOmD))
      .div(10000);

    const convertSlope = new Decimal(0.0122);
    const convertIntercept = new Decimal(0.0159);

    const OMPercent = POXC.minus(convertSlope).div(convertIntercept);

    return OMPercent.isNaN() ? 0 : OMPercent.toNumber();
  }

  private calculatePComplex(result: AnalysisStandardResult): number {
    const { intercept, slope, extractAmount } = result.laboratorySetting;
    const dirtWeightMehlich = this.DEFAULT_DIRT_WEIGHT_MEHLICH;

    if (!submitValueExists(result.preValue)) return 0;
    if (!submitValueExists(intercept)) return 0;
    if (!submitValueExists(slope)) return 0;

    const preValue = new Decimal(result.preValue);
    const interceptD = new Decimal(intercept);
    const slopeD = new Decimal(slope);
    const extractAmountD = new Decimal(extractAmount);
    const dirtWeightMehlichD = new Decimal(dirtWeightMehlich);

    const value = preValue
      .minus(interceptD)
      .div(slopeD)
      .times(25)
      .div(5)
      .times(extractAmountD.times(1000))
      .div(dirtWeightMehlichD.times(1000));

    return value.toNumber();
  }

  private calculateExtractRatio(result: AnalysisStandardResult): number {
    const { extractAmount } = result.laboratorySetting;
    const dirtWeightMehlich = this.DEFAULT_DIRT_WEIGHT_MEHLICH;

    if (
      !submitValueExists(result.preValue) ||
      !submitValueExists(extractAmount)
    )
      return 0;

    const extractAmountD = new Decimal(extractAmount);
    const dirtWeightMehlichD = new Decimal(dirtWeightMehlich);
    const preValueD = new Decimal(result.preValue);

    const value = preValueD.times(extractAmountD).div(dirtWeightMehlichD);
    return value.toNumber();
  }

  async calculateResults(
    results: AnalysisStandardResult[]
  ): Promise<AnalysisStandardResult[]> {
    if (results.length === 0) return [];

    console.time('calculateStandardResults');

    // In-memory calculation
    results.forEach(result => {
      // Ensure relations are loaded before calling this
      if (result.laboratorySetting && result.laboratorySetting.laboratory) {
        result.postValue = this.calculatePostValue(result);
      }
    });

    // Bulk save
    const savedResults = await this.analysisStandardResultRepo.save(results);

    console.timeEnd('calculateStandardResults');
    return savedResults;
  }
}

function submitValueExists(value: any): boolean {
  return value !== null && value !== undefined;
}
