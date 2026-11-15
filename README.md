# أكاديمية المتجر

موقع إرشادي عربي لأصحاب المتاجر الإلكترونية: ربط المتجر بالمنصات الإعلانية وأدوات التتبع، ثم إنشاء الحملات خطوة بخطوة.

## التشغيل

```bash
npm install
cp .env.example .env.local   # ثم املأ القيم
npm run dev
```

قاعدة البيانات: نفّذ `db/schema.sql` مرة واحدة على Postgres (Supabase أو غيره). الموقع يتصل بها بإحدى طريقتين:

- `SUPABASE_URL` و `SUPABASE_KEY` (المفتاح العام publishable) — للإنتاج.
- `DATABASE_URL` — اتصال Postgres مباشر للتطوير المحلي.

## حساب الإدارة

لا يُحفظ في المستودع. يُضاف مرة واحدة في قاعدة البيانات:

```sql
insert into academy.users (username, username_lower, password_hash, role, status)
values ('ADMIN_NAME', lower('ADMIN_NAME'),
        extensions.crypt('ADMIN_PASSWORD', extensions.gen_salt('bf', 10)), 'admin', 'approved');
```

(في Postgres محلي بلا مخطط `extensions` احذف البادئة `extensions.`.)

## البنية

- `app/` الصفحات: التعريفية، الدخول والتسجيل، حالة الحساب، المنصات والخدمات والأدلة (مقفلة حتى موافقة الإدارة)، لوحة الإدارة.
- `content/<service>/NN-slug.md` الأدلة، بترويسة `title / summary / kind / order / illustration`.
- `lib/catalog.ts` المنصات والخدمات. `components/Illustration.tsx` الرسوم التوضيحية المتحركة.
- `db/schema.sql` الجداول ودوال الدخول والموافقة والإشعارات.
- `reference/` المادة المرجعية الخام (لا تُعرض في الموقع).
