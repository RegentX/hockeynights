# Frontend agent notes

## data-testid (обязательно)

Каждая UI-фича должна размечаться `data-testid` через `testId()` — см. `.cursor/rules/frontend-data-testid.mdc`.

Хелпер: `src/shared/testing/testId.ts`

```tsx
import {testId} from '@/shared/testing/testId'

data-testid={testId('auth', 'login', 'btn', 'submit')}
// → auth-login-btn-submit
```
