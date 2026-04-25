export default function LegalNoticePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 text-white/80 leading-relaxed">
      <h1 className="mb-6 text-2xl font-bold text-white">Правовая информация</h1>
      <p className="mb-2 text-sm text-white/50">Дата вступления в силу: 1 января 2026 г.</p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-white">1. Сведения о владельце Сервиса</h2>
      <table className="w-full text-left text-sm">
        <tbody className="divide-y divide-white/10">
          <tr><td className="py-2 pr-4 text-white/50 w-48">Наименование</td><td className="py-2">ИП Сидельников Дмитрий</td></tr>
          <tr><td className="py-2 pr-4 text-white/50">Правовая форма</td><td className="py-2">Индивидуальный предприниматель</td></tr>
          <tr><td className="py-2 pr-4 text-white/50">Страна регистрации</td><td className="py-2">Российская Федерация</td></tr>
          <tr><td className="py-2 pr-4 text-white/50">Email</td><td className="py-2">info@mindletics.com</td></tr>
        </tbody>
      </table>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-white">2. Назначение Сервиса</h2>
      <p>
        Веб-приложение Mindletics предназначено для организации и проведения соревнований,
        совмещающих физические упражнения и когнитивные тесты. Сервис обеспечивает регистрацию
        участников, прохождение тестов, подсчёт результатов и ведение рейтингов.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-white">3. Интеллектуальная собственность</h2>
      <p>
        Все элементы Сервиса, включая, но не ограничиваясь: дизайн, программный код, тексты,
        графические материалы, логотипы и товарные знаки — являются объектами интеллектуальной
        собственности ИП Сидельников Дмитрий и охраняются в соответствии с частью IV
        Гражданского кодекса Российской Федерации.
      </p>
      <p className="mt-2">
        Копирование, воспроизведение, распространение или иное использование материалов Сервиса
        без письменного согласия правообладателя запрещено.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-white">4. Ограничение ответственности</h2>
      <p>
        Информация, размещённая в Сервисе, носит информационный характер. Администрация не несёт
        ответственности за:
      </p>
      <ul className="ml-4 mt-2 list-disc space-y-1">
        <li>Любые убытки, возникшие в связи с использованием или невозможностью использования Сервиса</li>
        <li>Перебои в работе Сервиса по техническим причинам</li>
        <li>Действия третьих лиц</li>
        <li>Достоверность результатов, зависящих от корректности предоставленных данных</li>
      </ul>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-white">5. Применимое законодательство</h2>
      <p>
        Деятельность Сервиса регулируется законодательством Российской Федерации. Все споры
        подлежат разрешению в порядке, установленном действующим законодательством РФ.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-white">6. Контактная информация</h2>
      <p>ИП Сидельников Дмитрий</p>
      <p>Email: info@mindletics.com</p>
    </main>
  )
}
