# EVM Balance Checker

Check balances across all EVM networks for multiple wallets with proxy support.

Проверка балансов во всех EVM сетях для нескольких кошельков с поддержкой прокси.

---

## English

### Features

- ✅ **Multi-network support** - Check balances in 35+ EVM networks
- ✅ **Custom networks** - Add your own EVM-compatible networks
- ✅ **Multi-wallet support** - Check multiple wallets in one run
- ✅ **Proxy support** - Use proxies for all network requests
- ✅ **USD conversion** - Automatic price fetching and USD conversion
- ✅ **Detailed reports** - Per-wallet and total balance summaries
- ✅ **Error handling** - Retry mechanism and detailed error messages
- ✅ **RPC configuration** - Easy RPC endpoint management via config file

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure RPC endpoints:**
   Edit `rpc-config.json` and add your RPC endpoints:
   ```json
   {
     "ethereum": "https://your-rpc-endpoint.com",
     "bsc": "https://your-bsc-rpc.com"
   }
   ```

3. **Add wallets:**
   Edit `walletProxy/walletProxy` file:
   ```
   privatekey|ip:port:login:pass
   ```

4. **Run:**
   ```bash
   npm start
   ```

### Configuration Files

- `rpc-config.json` - RPC endpoints and custom networks (see [RPC-CONFIG-README.md](RPC-CONFIG-README.md))
- `walletProxy/walletProxy` - Wallets and proxies (see [walletProxy/README.md](walletProxy/README.md))
- `config.json` - Project name and settings

### Supported Networks

Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, Base, Linea, zkSync Era, Scroll, Fantom, Celo, Gnosis, Mantle, Blast, Zora, Mode, opBNB, Manta, Metis, Moonbeam, Moonriver, Cronos, Boba, Aurora, Fuse, Evmos, Kava, Canto, zkFair, Merlin, BTR, and custom networks.

### Output Format

For each wallet:
- Address and proxy information
- Balances by network with USD values
- Total wallet balance in USD

Final summary:
- Total balances across all wallets by network
- Grand total in USD

### Requirements

- Node.js 18+ 
- npm

### Dependencies

- `ethers` - Ethereum library
- `undici` - HTTP client with proxy support

---

## Русский

### Функции

- ✅ **Поддержка множества сетей** - Проверка балансов в 35+ EVM сетях
- ✅ **Пользовательские сети** - Добавление собственных EVM-совместимых сетей
- ✅ **Множественные кошельки** - Проверка нескольких кошельков за один запуск
- ✅ **Поддержка прокси** - Использование прокси для всех сетевых запросов
- ✅ **Конвертация в USD** - Автоматическое получение цен и конвертация в доллары
- ✅ **Детальные отчеты** - Сводки по каждому кошельку и общие итоги
- ✅ **Обработка ошибок** - Механизм повторов и детальные сообщения об ошибках
- ✅ **Настройка RPC** - Управление RPC endpoints через конфигурационный файл

### Быстрый старт

1. **Установите зависимости:**
   ```bash
   npm install
   ```

2. **Настройте RPC endpoints:**
   Отредактируйте `rpc-config.json` и добавьте ваши RPC endpoints:
   ```json
   {
     "ethereum": "https://your-rpc-endpoint.com",
     "bsc": "https://your-bsc-rpc.com"
   }
   ```

3. **Добавьте кошельки:**
   Отредактируйте файл `walletProxy/walletProxy`:
   ```
   privatekey|ip:port:login:pass
   ```

4. **Запустите:**
   ```bash
   npm start
   ```

### Файлы конфигурации

- `rpc-config.json` - RPC endpoints и пользовательские сети (см. [RPC-CONFIG-README.md](RPC-CONFIG-README.md))
- `walletProxy/walletProxy` - Кошельки и прокси (см. [walletProxy/README.md](walletProxy/README.md))
- `config.json` - Название проекта и настройки

### Поддерживаемые сети

Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, Base, Linea, zkSync Era, Scroll, Fantom, Celo, Gnosis, Mantle, Blast, Zora, Mode, opBNB, Manta, Metis, Moonbeam, Moonriver, Cronos, Boba, Aurora, Fuse, Evmos, Kava, Canto, zkFair, Merlin, BTR и пользовательские сети.

### Формат вывода

Для каждого кошелька:
- Адрес и информация о прокси
- Балансы по каждой сети с USD значениями
- Общий баланс кошелька в USD

Итоговая сводка:
- Общие балансы по всем кошелькам по каждой сети
- Общий итог в USD

### Требования

- Node.js 18+
- npm

### Зависимости

- `ethers` - Библиотека для работы с Ethereum
- `undici` - HTTP клиент с поддержкой прокси

---

## TG: @who0ami11
