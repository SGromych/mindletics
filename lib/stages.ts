export type StageType = "physical" | "cognitive"

export interface Stage {
  stageNo: number
  type: StageType
  title: string
}

export const TOTAL_STAGES = 6

export function buildStages(exercises: string[]): Stage[] {
  return [
    { stageNo: 1, type: "cognitive", title: "Когнитивная станция 1" },
    { stageNo: 2, type: "physical", title: exercises[0] || "Упражнение 1" },
    { stageNo: 3, type: "cognitive", title: "Когнитивная станция 2" },
    { stageNo: 4, type: "physical", title: exercises[1] || "Упражнение 2" },
    { stageNo: 5, type: "cognitive", title: "Когнитивная станция 3" },
    { stageNo: 6, type: "physical", title: exercises[2] || "Упражнение 3" },
  ]
}

export function getStageFromList(stages: Stage[], stageNo: number): Stage | undefined {
  return stages.find((s) => s.stageNo === stageNo)
}

export function isCognitiveStage(stageNo: number): boolean {
  return stageNo % 2 === 1
}

export function isLastStage(stageNo: number): boolean {
  return stageNo === TOTAL_STAGES
}

export function getNextStageNo(current: number): number | null {
  return current < TOTAL_STAGES ? current + 1 : null
}

export function stageToStationIndex(stageNo: number): 0 | 1 | 2 {
  return Math.floor((stageNo - 1) / 2) as 0 | 1 | 2
}
