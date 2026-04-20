// 事例データを診断システムに組み込むためのTypeScriptモジュール
// /src/data/cases.ts として配置

import type { CaseData } from "../utils/caseMatcher";
import casesJson from "./cases.json";

export const ALL_CASES: CaseData[] = casesJson as CaseData[];
