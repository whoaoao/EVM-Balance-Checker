# RPC Configuration Guide / Руководство по настройке RPC

## English

### Quick Start

Edit `rpc-config.json` to configure RPC endpoints and add custom networks.

### 1. Replace RPC for Existing Networks

Simply specify the RPC URL:

```json
{
  "ethereum": "https://your-rpc-endpoint.com",
  "bsc": "https://your-bsc-rpc.com"
}
```

### 2. Add Custom Network

Add your network to `custom_networks` array:

```json
{
  "ethereum": "https://rpc.mevblocker.io",
  "custom_networks": [
    {
      "key": "my_chain",
      "name": "My Custom Chain",
      "chainId": 12345,
      "rpc": "https://rpc.my-chain.io",
      "symbol": "TOKEN"
    }
  ]
}
```

### Required Fields

- `key` - unique identifier (letters, numbers, underscores)
- `name` - display name
- `chainId` - network chain ID (number)
- `rpc` - RPC endpoint URL (must start with `https://`)
- `symbol` - native token symbol

### Example

```json
{
  "custom_networks": [
    {
      "key": "taiko",
      "name": "Taiko",
      "chainId": 167000,
      "rpc": "https://rpc.taiko.xyz",
      "symbol": "ETH"
    }
  ]
}
```

### Notes

- Only networks in `rpc-config.json` will be checked
- Empty `custom_networks: []` is ignored
- Use only `https://` endpoints (WebSocket not supported)

---

## Русский

### Быстрый старт

Отредактируйте `rpc-config.json` для настройки RPC endpoints и добавления пользовательских сетей.

### 1. Замена RPC для существующих сетей

Просто укажите URL RPC:

```json
{
  "ethereum": "https://your-rpc-endpoint.com",
  "bsc": "https://your-bsc-rpc.com"
}
```

### 2. Добавление пользовательской сети

Добавьте вашу сеть в массив `custom_networks`:

```json
{
  "ethereum": "https://rpc.mevblocker.io",
  "custom_networks": [
    {
      "key": "my_chain",
      "name": "My Custom Chain",
      "chainId": 12345,
      "rpc": "https://rpc.my-chain.io",
      "symbol": "TOKEN"
    }
  ]
}
```

### Обязательные поля

- `key` - уникальный идентификатор (латинские буквы, цифры, подчеркивания)
- `name` - отображаемое название
- `chainId` - ID сети (число)
- `rpc` - URL RPC endpoint (должен начинаться с `https://`)
- `symbol` - символ нативной валюты

### Пример

```json
{
  "custom_networks": [
    {
      "key": "taiko",
      "name": "Taiko",
      "chainId": 167000,
      "rpc": "https://rpc.taiko.xyz",
      "symbol": "ETH"
    }
  ]
}
```

### Примечания

- Проверяются только сети из `rpc-config.json`
- Пустой `custom_networks: []` игнорируется
- Используйте только `https://` endpoints (WebSocket не поддерживается)
