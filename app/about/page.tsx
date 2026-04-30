import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-surface text-white">
      {/* Hero */}
      <section className="relative flex items-center justify-center overflow-hidden py-24 px-6">
        <div className="absolute inset-0">
          <Image src="/images/hero-deadlift.jpg" alt="" fill className="object-cover opacity-20" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-surface/60 to-surface" />
        </div>
        <div className="relative z-10 max-w-3xl text-center">
          <Image src="/mindletics_transparent2.png" alt="Mindletics" width={320} height={72} className="mx-auto mb-6" priority />
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
            Первый в мире проект, где побеждает<br />
            не только <span className="text-accent">сила</span>, но и <span className="text-accent">ясность ума</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Mindletics — гибрид, в котором ты соревнуешься с самим собой, проверяя,
            насколько ты готов к любым вызовам — физическим и интеллектуальным.
          </p>
        </div>
      </section>

      {/* Что такое Mindletics */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Что такое Mindletics?</h2>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-white/80 leading-relaxed mb-4">
              Инструмент саморазвития, который работает на трёх уровнях:
              <strong className="text-white"> физическом, когнитивном и социально-психологическом</strong>.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              Ценностное предложение строится на уникальном сочетании физического и когнитивного развития.
              Тело и мозг работают одновременно. Физика и когнитика интегрированы в единый поток.
            </p>
            <p className="text-white/60 italic border-l-4 border-accent pl-4">
              Реальная нагрузка + реальный интеллект: никаких симуляторов, только проверка себя.
            </p>
          </div>
          <div className="relative h-80 rounded-2xl overflow-hidden">
            <Image src="/images/barbell-power.jpg" alt="Сила и интеллект" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
          </div>
        </div>
      </section>

      {/* Три столпа */}
      <section className="bg-surface-card/50 py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-10 text-center">Комплексное развитие</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-surface-card p-6 border border-white/5">
              <div className="text-3xl mb-3">💪</div>
              <h3 className="text-lg font-bold mb-2">Физическое</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Функциональные упражнения, адаптированные для новичков и продвинутых.
                Уникальное состояние, когда мозг «отказывает» из-за усталости, а потом снова включается.
              </p>
            </div>
            <div className="rounded-2xl bg-surface-card p-6 border border-white/5">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="text-lg font-bold mb-2">Когнитивное</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Логика, память, реакция, пространственное мышление — четыре блока когнитивных тестов
                между физическими этапами.
              </p>
            </div>
            <div className="rounded-2xl bg-surface-card p-6 border border-white/5">
              <div className="text-3xl mb-3">🔬</div>
              <h3 className="text-lg font-bold mb-2">Нейробиологический эффект</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Высокоинтенсивные интервалы + когнитивные задачи стимулируют выработку BDNF —
                белка, улучшающего нейропластичность.
              </p>
            </div>
          </div>
          <blockquote className="mt-8 text-center text-white/70 italic max-w-2xl mx-auto border-l-4 border-accent pl-4">
            Тренируй не только мышцы, но и нейронные связи. Mindletics — это доказанный способ
            сохранять мозг молодым, пока тело становится сильным.
          </blockquote>
        </div>
      </section>

      {/* Измеримый прогресс */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="relative h-80 rounded-2xl overflow-hidden order-2 md:order-1">
            <Image src="/images/assault-bike.jpg" alt="Тренировка" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-2xl font-bold mb-6">Измеримый прогресс</h2>
            <ul className="space-y-3 text-white/80">
              <li className="flex gap-3">
                <span className="text-accent font-bold shrink-0">01</span>
                <span>Двойная система оценки: физическое время + когнитивный индекс (ошибки, скорость)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold shrink-0">02</span>
                <span>Отслеживание динамики от старта к старту</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold shrink-0">03</span>
                <span>Полный профиль развития: насколько ты стал быстрее и насколько — умнее</span>
              </li>
            </ul>
            <p className="mt-6 text-white/60 italic border-l-4 border-accent pl-4">
              Ты получишь не просто медаль, а полный профиль своего развития.
            </p>
          </div>
        </div>
      </section>

      {/* Эмоции и драйв */}
      <section className="bg-surface-card/50 py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Эмоции и драйв</h2>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-white/80 leading-relaxed mb-4">
                Адреналин физической нагрузки сталкивается с интеллектуальным вызовом.
                Мозг вынужден работать на пределе — и именно в этот момент ты узнаёшь о себе больше всего.
              </p>
              <p className="text-white/80 leading-relaxed mb-4">
                В жизни часто нужно принимать решения в состоянии стресса и усталости.
                Mindletics тренирует эту способность напрямую.
              </p>
              <p className="text-white/60 italic border-l-4 border-accent pl-4">
                На работе, в семье, в неожиданных ситуациях — ты будешь быстрее соображать,
                когда другие теряют голову. Mindletics готовит к реальности.
              </p>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden">
              <Image src="/images/dumbbell-snatch.jpg" alt="Тренировка и вызов" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Сообщество */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Гибридная элита</h2>
        <p className="text-center text-white/70 max-w-2xl mx-auto mb-10">
          Участники Mindletics — люди, которые ценят и тело, и интеллект.
          Присоединяйся к сообществу, где ценят всё сразу.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-surface-card p-6 border border-white/5">
            <h3 className="text-lg font-bold mb-2">Командные форматы</h3>
            <ul className="text-white/60 text-sm space-y-1">
              <li>• Участие в парах, эстафетах, корпоративных лигах</li>
              <li>• Сплочение, дружеская конкуренция, общие цели</li>
              <li>• Яркие фото, видео, результаты</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-surface-card p-6 border border-white/5">
            <h3 className="text-lg font-bold mb-2">Философия</h3>
            <p className="text-white/60 text-sm italic">
              «Мы верим: настоящий атлет — это не только мышцы, но и острый ум.
              Mindletics возвращает тренировки к их истинной цели — гармоничному развитию человека.»
            </p>
          </div>
        </div>
      </section>

      {/* Аудитория */}
      <section className="bg-surface-card/50 py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-10 text-center">Для кого Mindletics?</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-surface p-6 border border-white/5">
              <h3 className="text-accent font-bold mb-2">Любители фитнеса / CrossFit / HYROX</h3>
              <p className="text-white/60 text-sm">
                Ты уже сильный. А насколько ты умный, когда устал? Новый вызов для тех,
                кто хочет большего, чем просто километры и килограммы.
              </p>
            </div>
            <div className="rounded-2xl bg-surface p-6 border border-white/5">
              <h3 className="text-accent font-bold mb-2">Офисные работники, IT-специалисты</h3>
              <p className="text-white/60 text-sm">
                Твой мозг работает 24/7. Дай ему новую нагрузку — в условиях реальной физической нагрузки.
                Улучшишь когнитивную выносливость, которая пригодится и в работе.
              </p>
            </div>
            <div className="rounded-2xl bg-surface p-6 border border-white/5">
              <h3 className="text-accent font-bold mb-2">Корпоративные клиенты (тимбилдинг)</h3>
              <p className="text-white/60 text-sm">
                Сплотите команду через общий вызов. В эстафете Mindletics каждый внесёт вклад:
                сила, скорость, логика, память — всё пригодится.
              </p>
            </div>
            <div className="rounded-2xl bg-surface p-6 border border-white/5">
              <h3 className="text-accent font-bold mb-2">Амбициозные атлеты (Pro)</h3>
              <p className="text-white/60 text-sm">
                Стань первым в новом формате. Mindletics — это шанс войти в историю,
                пока другие только думают.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ценности */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-bold mb-10 text-center">Главные ценности</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[
            { n: "01", title: "Уникальность", text: "Первый проект, объединяющий функциональный фитнес и когнитивные тесты" },
            { n: "02", title: "Двойной прогресс", text: "Измеримое улучшение и тела, и мозга" },
            { n: "03", title: "Доступность", text: "Безопасные упражнения, подходит для любого уровня подготовки" },
            { n: "04", title: "Эмоции", text: "Азарт, преодоление, чувство победы над собой" },
            { n: "05", title: "Сообщество", text: "Статус «гибридного атлета», командные форматы" },
            { n: "06", title: "Философия", text: "Гармоничное развитие человека, подготовка к реальным вызовам жизни" },
          ].map((v) => (
            <div key={v.n} className="flex gap-4 items-start rounded-xl bg-surface-card/60 p-5 border border-white/5">
              <span className="text-accent text-2xl font-extrabold leading-none">{v.n}</span>
              <div>
                <h3 className="font-bold mb-1">{v.title}</h3>
                <p className="text-white/60 text-sm">{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Основатель */}
      <section className="bg-surface-card/50 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-10 text-center">Основатель</h2>
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="shrink-0">
              <div className="relative w-64 h-72 rounded-2xl overflow-hidden">
                <Image
                  src="/images/chess-event.jpg"
                  alt="Дмитрий Сидельников"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Дмитрий Сидельников</h3>
              <p className="text-accent text-sm mb-4">sid-di-sid@yandex.ru</p>
              <ul className="space-y-2 text-white/80 text-sm leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-accent shrink-0">•</span>
                  Сертифицированный тренер CrossFit Level-2
                </li>
                <li className="flex gap-2">
                  <span className="text-accent shrink-0">•</span>
                  Старший тренер клубов The Most и Ils-Challenge (г. Санкт-Петербург)
                </li>
                <li className="flex gap-2">
                  <span className="text-accent shrink-0">•</span>
                  Постоянный участник и многократный призёр международных соревнований по CrossFit и Functional Fitness
                </li>
                <li className="flex gap-2">
                  <span className="text-accent shrink-0">•</span>
                  Увлекается шахматами и книгами
                </li>
              </ul>
              <blockquote className="mt-6 text-white/60 italic border-l-4 border-accent pl-4 text-sm">
                «Мы верим: настоящий атлет — это не только мышцы, но и острый ум.
                Mindletics выбирают те, кто не хочет выбирать между умом и силой.»
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-xl font-bold mb-6">
            Беги. Тягай. Думай. <span className="text-accent">Побеждай.</span>
          </p>
          <Link
            href="/"
            className="inline-flex min-h-btn items-center justify-center rounded-xl bg-accent px-8 py-4 text-lg font-bold text-black transition hover:bg-accent-dark"
          >
            Перейти к соревнованиям
          </Link>
        </div>
      </section>
    </main>
  )
}
