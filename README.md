# Auto PiP for Safari on Mac

Automatically attempts to open playing HTML5 videos in macOS Picture-in-Picture (PiP) mode when you switch tabs or minimize the browser window.

When you return to the page, videos opened automatically by the extension are restored to their original position. Videos opened in PiP manually are not closed by the extension.

The extension lets you disable automatic PiP activation, disable automatic restoration, and open PiP manually through its popup menu.

Website permissions are required to detect videos. The extension makes no network requests and does not collect analytics or transmit user data.

## Contents

**English**
- [Installation](#installation)
  - [Temporary installation](#temporary-installation)
  - [Installation via Xcode](#installation-via-xcode)
- [Limitations and testing](#limitations-and-testing)
- [Tests](#tests)
- [References](#references)

**Русский**
- [Описание](#описание)
- [Установка](#установка)
  - [Временная установка из папки](#временная-установка-из-папки)
  - [Установка через Xcode](#установка-через-xcode)
- [Ограничения и проверка в Safari](#ограничения-и-проверка-в-safari)
- [Проверки](#проверки)
- [Документация Apple](#документация-apple)

---

# English

## Installation

### Temporary installation

On Safari versions that support temporary web extension installation:

1. Open **Safari → Settings → Advanced** and enable web developer features.
2. Open the **Develop** menu and select **Temporarily Install Web Extension**, then choose the `extension` directory.
3. Go to **Safari → Settings → Extensions**, enable Auto PiP, and grant access to the required websites.
4. Reload the page, start playing a video, and switch to another tab.

Temporary installation is intended for testing. Safari may remove the extension after the browser session ends.

### Installation via Xcode

1. Open `native/Auto PiP/Auto PiP.xcodeproj`.
2. Select the **Auto PiP** scheme and **My Mac** as the destination.
3. In **Signing & Capabilities**, select your development Team for both targets. For local debugging without code signing, allow unsigned extensions in Safari's developer settings.
4. Select **Product → Run**, then enable the extension in Safari settings.
5. Grant website access and reload the page containing the video.

To build without code signing for testing:

```sh
xcodebuild -project 'native/Auto PiP/Auto PiP.xcodeproj' -scheme 'Auto PiP' -configuration Debug -derivedDataPath build CODE_SIGNING_ALLOWED=NO build
```

## Limitations and testing

Automatic PiP activation is an attempt, not a guarantee. Safari may require a user gesture, and some websites or protected video players may not support PiP.

The extension's manual PiP button also depends on whether the installed Safari version forwards the user gesture to the content script.

If PiP activation is rejected, use the video's built-in Picture-in-Picture controls.

The extension supports videos inside:
- Regular DOM elements
- Open Shadow DOM
- Accessible frames

Website permissions must also be granted for domains hosting embedded video players.

Closed Shadow DOM elements are not accessible.

When multiple videos are playing in different frames, Safari determines which video appears in the system PiP window. The manual button does not guarantee selection of an embedded player.

When multiple videos exist within the same frame, priority is given to the most recently played video, followed by the video with the largest resolution.

**Recommended manual testing:**

1. Start playing a video.
2. Switch to another tab.
3. Return to the original tab.
4. Test with a paused video.
5. Test with PiP opened manually.
6. Test with automatic PiP disabled.

Actual automatic PiP behavior in Safari has not yet been verified on real websites.

## Tests

Run the automated tests:

```sh
node --test tests/content.test.cjs
```

The tests cover visibility changes and handling of rejected PiP requests using mocked browser APIs.

They do not verify Safari permissions or browser-specific restrictions.

## References

- [Apple — Adding Picture in Picture to Your Safari Media Controls](https://developer.apple.com/documentation/webkitjs/adding_picture_in_picture_to_your_safari_media_controls)
- [Apple — Running Your Safari Web Extension](https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension)

---

# Русский

## Описание

Расширение автоматически пытается открыть воспроизводящееся HTML5-видео в системном окне «картинка в картинке» (Picture-in-Picture, PiP), когда страница становится скрытой — при смене вкладки или сворачивании окна Safari.

При возвращении на страницу видео, автоматически открытое расширением, возвращается на прежнее место. Вручную открытое PiP расширение не закрывает.

В меню расширения можно отключить автоматический запуск PiP, отключить автоматический возврат видео и открыть PiP вручную.

Доступ к сайтам нужен для поиска видео. Расширение не выполняет сетевых запросов, не собирает аналитику и не передаёт пользовательские данные.

## Установка

### Временная установка из папки

В версиях Safari, поддерживающих временную установку веб-расширений:

1. Откройте **Safari → Настройки → Дополнения** и включите функции для веб-разработчиков.
2. В меню **Разработка** выберите **Temporarily Install Web Extension** и укажите папку `extension`.
3. В **Safari → Настройки → Расширения** включите Auto PiP и разрешите доступ к нужным сайтам.
4. Обновите страницу, запустите видео и переключитесь на другую вкладку.

Временная установка предназначена для тестирования. Safari может удалить расширение после завершения сессии.

### Установка через Xcode

1. Откройте `native/Auto PiP/Auto PiP.xcodeproj`.
2. Выберите схему **Auto PiP** и устройство **My Mac**.
3. В разделе **Signing & Capabilities** обоих targets укажите свою Team для подписи. Для локальной отладки без подписи разрешите неподписанные расширения в настройках разработчика Safari.
4. Выполните **Product → Run** и включите расширение в настройках Safari.
5. Разрешите доступ к сайту и обновите страницу с видео.

Сборка для проверки без подписи:

```sh
xcodebuild -project 'native/Auto PiP/Auto PiP.xcodeproj' -scheme 'Auto PiP' -configuration Debug -derivedDataPath build CODE_SIGNING_ALLOWED=NO build
```

## Ограничения и проверка в Safari

Автоматическое включение PiP — попытка, а не гарантия. Safari может требовать пользовательский жест, а сайт или защищённый видеоплеер — не поддерживать PiP.

Кнопка в расширении также зависит от того, передаёт ли версия Safari пользовательский жест в content script.

Если запуск отклонён, используйте штатное меню PiP самого видео.

Расширение работает с видео в:
- Обычном DOM
- Открытом Shadow DOM
- Доступных фреймах

Доступ к домену встроенного плеера тоже нужно разрешить.

Закрытые Shadow DOM недоступны.

При нескольких одновременно воспроизводящихся видео в разных фреймах Safari выбирает итоговое системное PiP. Ручная кнопка не гарантирует выбор вложенного плеера.

При нескольких видео в одном фрейме приоритет имеет последнее запущенное, затем самое большое по разрешению.

**Рекомендуемая проверка:**

1. Запустите видео.
2. Переключитесь на другую вкладку.
3. Вернитесь на исходную вкладку.
4. Проверьте поведение с остановленным видео.
5. Проверьте вручную открытое PiP.
6. Проверьте работу с отключённым автоматическим запуском.

Реальная автоматическая работа расширения в Safari на сайтах ещё не проверена.

## Проверки

Запуск автоматических тестов:

```sh
node --test tests/content.test.cjs
```

Тесты проверяют логику смены видимости и обработку отказа через имитацию браузерного API.

Они не проверяют разрешения или ограничения Safari.

## Документация Apple

- [Apple — Adding Picture in Picture to Your Safari Media Controls](https://developer.apple.com/documentation/webkitjs/adding_picture_in_picture_to_your_safari_media_controls)
- [Apple — Running Your Safari Web Extension](https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension)
