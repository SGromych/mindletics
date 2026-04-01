export type StageType = "physical" | "cognitive"
export type TestType = "logic" | "memory" | "reaction" | "visual_final"

export interface Stage {
  stageNo: number
  type: StageType
  title: string
  testType?: TestType
}

export const STAGES: Stage[] = [
  { stageNo: 1, type: "physical", title: "1 км гребля" },
  { stageNo: 2, type: "cognitive", title: "Логика / абстрактное мышление", testType: "logic" },
  { stageNo: 3, type: "physical", title: "40 становых тяг + 40 берпи" },
  { stageNo: 4, type: "cognitive", title: "Память", testType: "memory" },
  { stageNo: 5, type: "physical", title: "3 раунда: байк + коробка" },
  { stageNo: 6, type: "cognitive", title: "Скорость реакции", testType: "reaction" },
  { stageNo: 7, type: "physical", title: "300 м челночный бег" },
  { stageNo: 8, type: "cognitive", title: "Финальный визуальный блок", testType: "visual_final" },
]

export const TOTAL_STAGES = STAGES.length

export function getStage(stageNo: number): Stage | undefined {
  return STAGES.find((s) => s.stageNo === stageNo)
}

export function isCognitiveStage(stageNo: number): boolean {
  return getStage(stageNo)?.type === "cognitive"
}

export function isLastStage(stageNo: number): boolean {
  return stageNo === TOTAL_STAGES
}

export function getNextStageNo(current: number): number | null {
  return current < TOTAL_STAGES ? current + 1 : null
}
