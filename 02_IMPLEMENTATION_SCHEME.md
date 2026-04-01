# Mindletics — простая схема реализации

## Общий подход

Для MVP не нужно строить тяжёлую архитектуру. Лучше сделать обычное веб-приложение, которое открывается на планшете по URL.

Оптимальный вариант:
- **frontend и backend в одном Next.js проекте**;
- **PostgreSQL** как база данных;
- **Prisma** как ORM;
- **polling** для live-табло вместо сложного real-time стека.

Это даст:
- быстрый старт;
- меньше инфраструктуры;
- проще поддержка;
- проще передать проект дальше.

---

## Предлагаемая архитектура

### 1. Клиентская часть
Next.js app router.

Основные страницы:
- `/` — главный экран
- `/event/new` — создание event
- `/participant/register` — регистрация участника
- `/attempt/[id]` — экран участника
- `/live/[eventId]` — live-табло
- `/leaderboards` — лидерборды

### 2. Серверная часть
API внутри Next.js:
- `POST /api/events`
- `GET /api/events`
- `POST /api/participants`
- `POST /api/attempts/start`
- `POST /api/attempts/next-level`
- `POST /api/attempts/abort`
- `GET /api/attempts/:id`
- `GET /api/live/:eventId`
- `GET /api/leaderboards`

### 3. База данных
PostgreSQL + Prisma.

Основные сущности:
- Event
- Participant
- Attempt
- StageResult
- AnswerLog

---

## Почему без сложной авторизации

По требованиям:
- ролей нет;
- логин/пароль не нужен;
- пользователь просто вводит данные;
- запись идёт сразу в базу.

Поэтому:
- не нужен Auth0;
- не нужен NextAuth;
- не нужен JWT;
- не нужен RBAC.

Если позже понадобится, можно добавить PIN-код на экран организатора.

---

## Как организовать event

Пока event один и сценарий фиксированный. Поэтому не нужен гибкий конструктор этапов.

Можно сделать так:
- в коде хранится фиксированный массив этапов;
- при создании event эти этапы автоматически привязываются логически;
- participant/attempt идёт по stage_no = 1..8.

Пример:
```ts
const STAGES = [
  { stageNo: 1, type: "physical", title: "1 км гребля" },
  { stageNo: 2, type: "cognitive", title: "Логика / абстрактное мышление", testType: "logic" },
  { stageNo: 3, type: "physical", title: "40 становых тяг + 40 берпи" },
  { stageNo: 4, type: "cognitive", title: "Память", testType: "memory" },
  { stageNo: 5, type: "physical", title: "3 раунда: байк + коробка" },
  { stageNo: 6, type: "cognitive", title: "Скорость реакции", testType: "reaction" },
  { stageNo: 7, type: "physical", title: "300 м челночный бег" },
  { stageNo: 8, type: "cognitive", title: "Финальный визуальный блок", testType: "visual_final" }
];
```

---

## Как хранить тесты

Так как задания одинаковые для всех и без рандомизации, можно сделать очень просто:

### Вариант хранения
- в коде как JSON-константы;
- или в отдельных `.json` файлах.

Это быстрее, чем сразу строить конструктор банка заданий.

Структура:
- `data/tests/logic.json`
- `data/tests/memory.json`
- `data/tests/reaction.json`
- `data/tests/visual_final.json`

---

## Как организовать когнитивные блоки

### Блок 1. Логика
Форматы:
- number-series
- figure-sequence
- mini-matrix

### Блок 2. Память
Форматы:
- memorise-objects
- memorise-grid
- memorise-sequence

### Блок 3. Реакция
Форматы:
- choice-reaction
- go-no-go
- stroop

### Блок 4. Финальный визуальный
Форматы:
- target-search
- pair-compare
- visual-analogy

---

## Как сделать UI для планшета

### Общие принципы
- крупные кнопки;
- большие отступы;
- контраст;
- минимум текста;
- один главный action на экран;
- не больше 3–5 вариантов ответа;
- никаких мелких ссылок.

### Минимальные требования
- кнопки высотой от 56 px;
- безопасные отступы для тач-интерфейса;
- работа в landscape и portrait;
- адаптация под 10–12 дюймов.

---

## Логика прохождения участника

### Состояние attempt
- `registered`
- `in_progress`
- `finished`
- `aborted`

### Основные поля состояния
- currentStageNo
- startedAt
- finishedAt
- totalCorrect
- totalWrong

### Переходы
1. Участник зарегистрирован.
2. Нажимает Start.
3. Attempt получает статус `in_progress`.
4. Идёт этап 1.
5. По кнопке `Next level` переход на этап 2.
6. Если этап когнитивный — показываем тест.
7. После теста участник нажимает `Next level`.
8. После этапа 8 попытка завершается статусом `finished`.

---

## Как обрабатывать физические этапы

Физические этапы в MVP не измеряются отдельно автоматически. Фиксируем:
- время входа на этап;
- время выхода с этапа через нажатие `Next level`.

То есть длительность физического этапа считается как:
- `timestamp(next level pressed)` минус `timestamp(stage started)`.

---

## Как обрабатывать когнитивные этапы

Для каждого задания нужно сохранить:
- index задания;
- тип задания;
- текст/визуальную структуру задания;
- варианты ответа;
- правильный ответ;
- выбранный ответ;
- was_correct;
- response_time_ms.

Для всего блока:
- total_correct;
- total_wrong;
- started_at;
- finished_at;
- duration_sec.

---

## Как считать лидерборды

### Простая модель
Основные показатели:
- total_correct
- total_wrong
- total_time_sec
- status

### Правила сортировки
1. Finished выше Aborted.
2. Среди Finished:
   - больше `total_correct` — выше;
   - при равенстве меньше `total_time_sec` — выше.
3. Aborted идут ниже всех Finished.

---

## Как сделать live-табло просто

### Вариант MVP
Live-страница вызывает API каждые 2 секунды и перерисовывает таблицу.

Плюсы:
- очень просто;
- не нужны WebSocket;
- достаточно для MVP.

---

## Пример структуры проекта

```text
mindletics/
  app/
    page.tsx
    event/new/page.tsx
    participant/register/page.tsx
    attempt/[id]/page.tsx
    live/[eventId]/page.tsx
    leaderboards/page.tsx
  app/api/
    events/route.ts
    participants/route.ts
    attempts/start/route.ts
    attempts/next-level/route.ts
    attempts/abort/route.ts
    live/[eventId]/route.ts
    leaderboards/route.ts
  components/
    layout/
    forms/
    participant/
    live/
    tests/
  components/tests/
    LogicBlock.tsx
    MemoryBlock.tsx
    ReactionBlock.tsx
    VisualFinalBlock.tsx
  data/tests/
    logic.json
    memory.json
    reaction.json
    visual_final.json
  lib/
    prisma.ts
    stages.ts
    scoring.ts
    timers.ts
  prisma/
    schema.prisma
    seed.ts
  public/
  README.md
```

---

## Что желательно реализовать аккуратно

### 1. Подтверждение Abort
Обязательно модальное окно подтверждения.

### 2. Защита Next level
После нажатия:
- кнопка временно блокируется;
- повторный клик не должен отправить второй переход.

### 3. Автовосстановление
Если пользователь обновил страницу attempt:
- по id попытки должна восстановиться текущая стадия.

### 4. Сохранение в БД по ходу
Не откладывать сохранение до конца.
После каждого этапа сохранять данные.

---

## Что можно отложить
- экспорт в Excel;
- PDF-протокол;
- графики аналитики;
- много event одновременно;
- настройки тестов через UI;
- офлайн-режим;
- мультиязычность;
- сложную анимацию.

---

## Итоговая рекомендация

Для MVP нужно сделать:
- **один Next.js проект**,
- **PostgreSQL + Prisma**,
- **фиксированный сценарий event**,
- **фиксированные JSON-задания**,
- **polling для live-табло**,
- **минималистичный планшетный UI**.

Это даст рабочий результат быстро и без лишней инженерной сложности.
