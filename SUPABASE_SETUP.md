# Supabase Setup Guide

## ဒေါက်တာထွန်းမြတ်ဝင်း ကလိန်း Database Setup

ဤ guide သည် Supabase database ကို setup လုပ်ရန် အဆင့်ဆင့် လမ်းညွှန်ချက်များ ပါဝင်ပါသည်။

---

## Step 1: Supabase Account ဖန်တီးခြင်း

1. [https://supabase.com](https://supabase.com) သို့ သွားပါ
2. "Start your project" ကို နှိပ်ပါ
3. GitHub account ဖြင့် sign in လုပ်ပါ (သို့) Email ဖြင့် အကောင့်ဖန်တီးပါ

---

## Step 2: New Project ဖန်တီးခြင်း

1. Dashboard တွင် "New Project" ကို နှိပ်ပါ
2. Project details များ ဖြည့်ပါ:
   - **Name**: `dr-tun-myat-win-clinic`
   - **Database Password**: ခိုင်မာသော password တစ်ခု သတ်မှတ်ပါ (မှတ်ထားပါ!)
   - **Region**: Southeast Asia (Singapore) ကို ရွေးပါ
   - **Pricing Plan**: Free tier သည် စတင်ရန် လုံလောက်ပါသည်

3. "Create new project" ကို နှိပ်ပါ
4. Project ဖန်တီးပြီးရန် 2-3 မိနစ် စောင့်ပါ

---

## Step 3: API Credentials ရယူခြင်း

1. Project dashboard တွင် **Settings** (gear icon) သို့ သွားပါ
2. **API** section သို့ သွားပါ
3. အောက်ပါ values များကို copy လုပ်ပါ:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

---

## Step 4: Environment Variables သတ်မှတ်ခြင်း

1. Project root folder တွင် `.env.local` file ဖန်တီးပါ:
```bash
cp .env.local.example .env.local
```

2. `.env.local` file ကို ဖွင့်ပြီး အောက်ပါ values များ ဖြည့်ပါ:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 5: Database Schema တပ်ဆင်ခြင်း

### Method 1: SQL Editor (Recommended)

1. Supabase dashboard တွင် **SQL Editor** သို့ သွားပါ
2. "New query" ကို နှိပ်ပါ
3. `supabase/schema.sql` file ထဲရှိ code အားလုံးကို copy လုပ်ပါ
4. SQL Editor တွင် paste လုပ်ပါ
5. "Run" ကို နှိပ်ပါ
6. "Success. No rows returned" ဆိုတာ မြင်ရပါက အောင်မြင်ပါသည်

### Method 2: Supabase CLI

```bash
# Supabase CLI install လုပ်ရန်
npm install -g supabase

# Login လုပ်ရန်
supabase login

# Project နှင့် ချိတ်ဆက်ရန်
supabase link --project-ref your-project-id

# Schema တပ်ဆင်ရန်
supabase db push
```

---

## Step 6: Storage Buckets စစ်ဆေးခြင်း

1. **Storage** section သို့ သွားပါ
2. အောက်ပါ buckets များ ရှိနေသည်ကို သေချာပါ:
   - `health-records` - လူနာမှတ်တမ်းများ
   - `payment-screenshots` - ငွေပေးချေမှု screenshot များ
   - `avatars` - အသုံးပြုသူ profile ပုံများ

---

## Step 7: Authentication Setup

1. **Authentication** > **Providers** သို့ သွားပါ
2. **Email** provider ကို enable လုပ်ပါ (default)
3. လိုအပ်ပါက အောက်ပါ providers များကို enable လုပ်နိုင်ပါသည်:
   - Google OAuth
   - Facebook OAuth
   - Phone authentication

---

## Step 8: Default Doctor Account

Schema တပ်ဆင်ပြီးနောက် default doctor account တစ်ခု အလိုအလျောက် ဖန်တီးသွားပါမည်:

- **Email**: `doctor@clinic.com`
- **Password**: Supabase Auth တွင် သီးသန့် သတ်မှတ်ရန် လိုအပ်ပါသည်

### Doctor Password သတ်မှတ်ခြင်း:

1. **Authentication** > **Users** သို့ သွားပါ
2. "Add user" ကို နှိပ်ပါ
3. Email: `doctor@clinic.com`
4. Password: ခိုင်မာသော password တစ်ခု သတ်မှတ်ပါ
5. "Create user" ကို နှိပ်ပါ

---

## Step 9: Row Level Security (RLS) စစ်ဆေးခြင်း

Schema တွင် RLS policies များ ပါဝင်ပြီး ဖြစ်ပါသည်။ စစ်ဆေးရန်:

1. **Authentication** > **Policies** သို့ သွားပါ
2. အောက်ပါ tables များတွင် RLS enabled ဖြစ်နေသည်ကို သေချာပါ:
   - users
   - patients
   - doctors
   - appointments
   - medical_records
   - payments
   - messages
   - notifications

---

## Step 10: Testing

### Connection Test:

```bash
# Development server စတင်ပါ
npm run dev

# Browser တွင် ဖွင့်ပါ
http://localhost:3000

# Register page သို့ သွားပါ
http://localhost:3000/register

# အကောင့်အသစ် ဖန်တီးပါ
```

### API Test:

```bash
# Doctors API စမ်းသပ်ပါ
curl http://localhost:3000/api/doctors

# Appointments API စမ်းသပ်ပါ
curl http://localhost:3000/api/appointments
```

---

## Database Schema Overview

### Tables:

| Table | ရည်ရွယ်ချက် |
|-------|-------------|
| `users` | အသုံးပြုသူများ၏ အခြေခံအချက်အလက် |
| `patients` | လူနာများ၏ အသေးစိတ်အချက်အလက် |
| `doctors` | ဆရာဝန်များ၏ အသေးစိတ်အချက်အလက် |
| `appointments` | ချိန်းဆိုမှုများ |
| `prescriptions` | ဆေးညွှန်ကြားချက်များ |
| `medical_records` | လူနာမှတ်တမ်းများ |
| `payments` | ငွေပေးချေမှုများ |
| `messages` | စာတိုများ |
| `notifications` | အသိပေးချက်များ |

### Relationships:

```
users (1) ──── (1) patients
users (1) ──── (1) doctors
patients (1) ──── (∞) appointments
doctors (1) ──── (∞) appointments
appointments (1) ──── (1) payments
appointments (1) ──── (∞) medical_records
appointments (1) ──── (1) prescriptions
```

---

## Troubleshooting

### Error: "Invalid API key"
- `.env.local` file တွင် correct credentials များ ရှိနေကြောင်း စစ်ဆေးပါ
- Server ကို restart လုပ်ပါ (`npm run dev`)

### Error: "relation does not exist"
- Schema SQL ကို ထပ်မံ run ပါ
- Table names များ မှန်ကန်ကြောင်း စစ်ဆေးပါ

### Error: "permission denied"
- RLS policies များ မှန်ကန်စွာ setup လုပ်ထားကြောင်း စစ်ဆေးပါ
- User authentication ကို စစ်ဆေးပါ

---

## Support

အခက်အခဲရှိပါက:
- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)
- GitHub Issues: Project repository တွင် issue ဖွင့်ပါ

---

## Next Steps

1. ✅ Supabase project ဖန်တီးပါ
2. ✅ Database schema တပ်ဆင်ပါ
3. ✅ Environment variables သတ်မှတ်ပါ
4. ✅ Doctor account ဖန်တီးပါ
5. ✅ Application စမ်းသပ်ပါ
