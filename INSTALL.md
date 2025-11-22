# Инструкция по установке на вашем компьютере

## Шаги:

1. Удалите старые зависимости:
```bash
rm -rf node_modules package-lock.json
```

2. Установите зависимости заново:
```bash
npm install
```

3. Запустите dev-сервер:
```bash
npm run dev
```

Приложение откроется на http://localhost:5173 или http://localhost:5174

## Если все еще ошибка:

Убедитесь, что у вас установлена версия Node.js 18 или выше:
```bash
node --version
```

Если версия старше, обновите Node.js с https://nodejs.org/
