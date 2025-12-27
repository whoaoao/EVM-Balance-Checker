# Wallet Proxy Configuration / Конфигурация кошельков и прокси

## English

### File Format

File: `walletProxy/walletProxy`

Format: `privatekey|ip:port:login:pass`

One wallet per line.

### Example

```
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef|192.168.1.1:8080:user:pass
abc123def456789012345678901234567890123456789012345678901234567890|10.0.0.1:3128:login:password
```

### Notes

- Lines starting with `#` are ignored (comments)
- Empty lines are ignored
- Private key can be with or without `0x` prefix
- Proxy format: `ip:port:username:password`

---

## Русский

### Формат файла

Файл: `walletProxy/walletProxy`

Формат: `privatekey|ip:port:login:pass`

Один кошелек на строку.

### Пример

```
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef|192.168.1.1:8080:user:pass
abc123def456789012345678901234567890123456789012345678901234567890|10.0.0.1:3128:login:password
```

### Примечания

- Строки, начинающиеся с `#`, игнорируются (комментарии)
- Пустые строки игнорируются
- Приватный ключ может быть с префиксом `0x` или без него
- Формат прокси: `ip:port:username:password`

