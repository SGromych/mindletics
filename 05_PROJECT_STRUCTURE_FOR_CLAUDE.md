# Mindletics — ожидаемая структура проекта для Claude Code

## Цель
Сгенерировать проект так, чтобы его можно было быстро поднять локально и показать MVP.

---

## Рекомендуемый стек
- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL

---

## Желаемая структура

```text
mindletics/
  app/
    page.tsx
    event/
      new/
        page.tsx
    participant/
      register/
        page.tsx
    attempt/
      [attemptId]/
        page.tsx
    live/
      [eventId]/
        page.tsx
    leaderboards/
      page.tsx

    api/
      events/
        route.ts
      participants/
        route.ts
      attempts/
        start/
          route.ts
        next-level/
          route.ts
        abort/
          route.ts
        [attemptId]/
          route.ts
      live/
        [eventId]/
          route.ts
      leaderboards/
        route.ts

  components/
    ui/
    forms/
    layout/
    participant/
    live/
    leaderboard/
    tests/

  components/tests/
    LogicBlock.tsx
    MemoryBlock.tsx
    ReactionBlock.tsx
    VisualFinalBlock.tsx
    QuestionCard.tsx
    MemoryGrid.tsx
    ColorButtons.tsx
    OptionButtons.tsx

  lib/
    prisma.ts
    stages.ts
    scoring.ts
    attempt-state.ts
    test-engine.ts
    utils.ts

  data/
    tests/
      logic.json
      memory.json
      reaction.json
      visual_final.json

  prisma/
    schema.prisma
    seed.ts

  public/
  README.md
  package.json
  .env.example
```

---

## Ожидаемые сущности Prisma

### Event
- id
- hallName
- eventName
- eventDate
- createdAt

### Participant
- id
- displayName
- gender
- age
- eventId
- createdAt

### Attempt
- id
- participantId
- eventId
- status
- currentStageNo
- startedAt
- finishedAt
- totalTimeSec
- totalCorrect
- totalWrong

### StageResult
- id
- attemptId
- stageNo
- stageType
- stageTitle
- startedAt
- finishedAt
- durationSec
- correctAnswers
- wrongAnswers
- skippedAnswers
- rawAnswersJson

---

## Что должен уметь backend

### Event API
- создать event
- получить список event
- получить активный event

### Participant API
- зарегистрировать участника

### Attempt API
- старт попытки
- получить текущее состояние попытки
- перейти на следующий этап
- abort
- завершить когнитивный блок с сохранением результатов

### Live API
- получить сводку по текущему event

### Leaderboard API
- общий лидерборд
- лидерборд по текущему event
- лидерборд последнего event

---

## Что должен уметь frontend

### Главный экран
Навигация по основным разделам.

### Регистрация event
Форма создания event.

### Регистрация участника
Форма участника.

### Экран попытки
- Start
- Next level
- Abort
- таймер
- текущий этап
- история этапов

### Экран когнитивного блока
- рендер нужного набора заданий
- сбор ответов
- локальный контроль прогресса
- отправка результатов в backend

### Live-экран
- автообновление раз в 2 секунды

### Лидерборды
- таблицы результатов

---

## Что должен сделать Claude Code дополнительно

1. Подготовить `README.md`.
2. Подготовить `.env.example`.
3. Подготовить `seed.ts`.
4. Добавить несколько тестовых event / participants / attempts.
5. Сделать интерфейс, пригодный для планшета.
6. Сделать код без лишней сложности.
