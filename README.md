# Импорт банковской выписки

Тестовое задание Mobile Engineer: React Native и TypeScript, без Expo.

В `kit/` лежит неизменённый набор с mock API, в `client/` приложение, в `evidence/` видео прогонов. Отдельно есть [release note](RELEASE_NOTE.md) и [self-review](SELF_REVIEW.md).

Для запуска нужны Node.js 22.11+, Yarn, Xcode, Android SDK с эмулятором, JDK 17 и Ruby с Bundler.

## Запуск

Команды выполняются из корня репозитория. Клонируйте его в обычный каталог: путь через симлинк, например `/tmp` на macOS, ломает сборку `reanimated` на Android.

Mock запускается в отдельном терминале и работает всё время:

```bash
cd kit && npm run fixtures:oversize && npm test && npm start
```

Зависимости и тесты клиента:

```bash
cd client && cp .env.example .env && yarn install && yarn test
```

```bash
cd client/ios && bundle install && bundle exec pod install
```

Fixtures на запущенные эмулятор и симулятор:

```bash
./scripts/push-fixtures.sh
```

Приложение. Release-сборке Metro не нужен:

```bash
adb reverse tcp:8787 tcp:8787
```

```bash
cd client && yarn android --mode release
```

```bash
cd client && yarn ios --mode Release --simulator "iPhone 16 Pro"
```

Файлы в picker лежат на Android в Downloads, на iOS в Browse > On My iPhone.

Если `pod install` падает с `Unicode Normalization not appropriate`, выполните `export LANG=en_US.UTF-8`. Если Gradle пишет `Failed to install on any devices`, поставьте APK напрямую:

```bash
adb install -r client/android/app/build/outputs/apk/release/app-release.apk
```

## Сценарии

Сценарий, счётчики и сброс есть на экране «Диагностика». То же самое можно сделать через `/__test/*`, команды описаны в [README набора](kit/README.md). Состояние mock переживает его перезапуск, поэтому перед прогоном его нужно сбросить.

В `stale_status` устаревший ответ приходит на втором GET: после `ready` нажмите «Обновить» два раза.

## Результаты

Проверено 2 ноября 2026 на release-сборках из чистого клона, только на симуляторе и эмуляторе. На физических устройствах не запускалось. iOS собран из `c1c5369`, Android из `bb09d01`: между ними изменился только Android-код `react-native-blob-util`.

| Сценарий | Что видно | iOS 18.3, iPhone 16 Pro | Android 17, Pixel 9 Pro |
|---|---|---|---|
| `spoofed` + `oversize` | Отказ до отправки, `createRequests=0` | Пройдено | Пройдено |
| `happy` | Отчёт на 151.99 AUD/мес, `newJobs=1`, `sha256` совпал с файлом | Пройдено | Пройдено |
| `lost_ack` + relaunch | Задача найдена по ключу, отчёт на месте после перезапуска, `createRequests=1`, `newJobs=1` | Пройдено | Пройдено |
| `stale_status` | Отчёт не откатывается | Пройдено | Пройдено |
| `delete_failure` | «Импорт не удалён», после `happy` и повтора `deleted/5` и «Импорт удалён» | Пройдено | Пройдено |

Автотесты: `kit` 6/6, `client` 34/34.
