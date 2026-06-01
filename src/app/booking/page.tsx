'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageCircle,
  User,
  CreditCard,
  CheckCircle,
  ChevronLeft,
  Star,
  Globe,
  Upload,
  X,
  Copy,
  Smartphone
} from 'lucide-react';
import { useAppStore } from '@/store';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuthHydrated } from '@/hooks/use-auth-hydrated';
import { format, addDays } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';

const bookingSchema = z.object({
  consultationType: z.enum(['video', 'audio', 'chat']),
  date: z.string().min(1, 'နေ့ရွေးချယ်ပါ'),
  time: z.string().min(1, 'အချိန်ရွေးချယ်ပါ'),
  reason: z.string().min(10, 'ရောဂါလက္ခာရေးပါ (အနည်းဆုံး ၁၀ လုံး)'),
  notes: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

const timeSlots = [
  '၀၉:၀၀', '၀၉:၃၀', '၁၀:၀၀', '၁၀:၃၀', '၁၁:၀၀', '၁၁:၃၀',
  '၁၄:၀၀', '၁၄:၃၀', '၁၅:၀၀', '၁၅:၃၀', '၁၆:၀၀', '၁၆:၃၀',
];

const consultationTypes = [
  { type: 'video', icon: Video, key: 'videoConsultation', price: 15000 },
  { type: 'audio', icon: Phone, key: 'audioConsultation', price: 10000 },
  { type: 'chat', icon: MessageCircle, key: 'chatConsultation', price: 5000 },
];

const paymentMethods = [
  { id: 'kbzpay', name: 'KBZPay', logo: '💳', phone: '09421068582', accountName: 'U Tun Myat Win' },
  { id: 'wave', name: 'WavePay', logo: '💳', phone: '09421068582', accountName: 'U Tun Myat Win' },
  { id: 'ayapay', name: 'AYaPay', logo: '💳', phone: '09421068582', accountName: 'U Tun Myat Win' },
  { id: 'cash', name: 'လက်ငင်းပေးချင်း', logo: '💵', phone: '09421068582', accountName: 'U Tun Myat Win' },
];

export default function BookingPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, createAppointment, createPayment, addNotification, getDoctor } = useAppStore();
  const { language, setLanguage, t } = useLanguage();
  const authHydrated = useAuthHydrated();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('video');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('kbzpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState<string>('');
  const [healthRecords, setHealthRecords] = useState<File[]>([]);
  const [healthRecordPreviews, setHealthRecordPreviews] = useState<string[]>([]);

  const doctor = getDoctor('dr-1');

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  useEffect(() => {
    if (!authHydrated) return;
    if (!isAuthenticated) {
      router.replace('/login?redirect=/booking');
    }
  }, [authHydrated, isAuthenticated, router]);

  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return {
      date: format(date, 'yyyy-MM-dd'),
      day: format(date, 'EEE'),
      dayNum: format(date, 'd'),
      month: format(date, 'MMM'),
    };
  }).filter((_, i) => i < 7);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setValue('date', date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setValue('time', time);
  };

  const handlePaymentMethodClick = (methodId: string) => {
    setSelectedPayment(methodId);
    setShowPaymentDetails(true);
  };

  const handlePaymentScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePaymentScreenshot = () => {
    setPaymentScreenshot(null);
    setPaymentScreenshotPreview('');
  };

  const handleHealthRecordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setHealthRecords([...healthRecords, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHealthRecordPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveHealthRecord = (index: number) => {
    setHealthRecords(healthRecords.filter((_, i) => i !== index));
    setHealthRecordPreviews(healthRecordPreviews.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handlePayment = async () => {
    if (!paymentScreenshot) {
      alert('ငွေပေးချေမှု ဓာတ်ပုံတင်ပေးပါ');
      return;
    }

    // Get form data
    const formData = getValues();

    if (!formData.date || !formData.time || !formData.reason) {
      alert('အချက်အလက်များ ပြည့်စုံအောင် ဖြည့်သွင်းပါ');
      return;
    }

    setIsProcessing(true);

    // Convert payment screenshot to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const screenshotUrl = reader.result as string;

      // Create appointment first
      const appointment = createAppointment({
        patientId: currentUser?.id || '',
        doctorId: 'dr-1',
        date: new Date(formData.date),
        startTime: formData.time,
        endTime: formData.time.replace(':30', ':00').replace(':00', ':30'),
        type: formData.consultationType as 'video' | 'audio' | 'chat',
        status: 'pending',
        reason: formData.reason,
        notes: formData.notes || '',
        paymentStatus: 'pending',
        paymentAmount: consultationTypes.find(t => t.type === formData.consultationType)?.price || 15000,
        paymentMethod: selectedPayment,
        transactionId: `TXN-${Date.now()}`,
        healthRecords: healthRecordPreviews,
      });

      // Create payment with appointment ID
      const payment = createPayment({
        appointmentId: appointment.id,
        patientId: currentUser?.id || '',
        amount: consultationTypes.find(t => t.type === formData.consultationType)?.price || 15000,
        currency: 'MMK',
        method: selectedPayment as 'kbzpay' | 'wave' | 'ayapay' | 'cash',
        status: 'pending',
        screenshotUrl: screenshotUrl,
      });

      addNotification({
        userId: 'dr-1',
        title: 'ချိန်းဆိုမှုအသစ်',
        message: `လူနာမှ ${formData.consultationType} ချိန်းဆိုမှုတောင်းဆိုထားပါသည်`,
        type: 'appointment',
        read: false,
      });

      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(true);
      }, 2000);
    };
    reader.readAsDataURL(paymentScreenshot);
  };

  if (!authHydrated) {
    return (
      <div className="landing-page booking-page flex min-h-screen items-center justify-center p-4">
        <div className="booking-page__glow" aria-hidden />
        <Spinner className="relative z-10 size-10 text-primary-400" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (paymentSuccess) {
    return (
      <div className="landing-page booking-page flex min-h-screen items-center justify-center p-4">
        <div className="booking-page__glow" aria-hidden />
        <div className="clinical-panel relative z-10 mx-auto w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="myanmar-heading mb-4 text-2xl font-bold text-foreground">ချိန်းဆိုမှုအောင်မြင်ပါသည်!</h2>
          <p className="myanmar-text mb-6 text-muted-foreground">
            သင့်ချိန်းဆိုမှုအောင်မြင်ပြီးပါပြီ။ ဆရာဝန်မှ အတည်ပြုပြီးနောက် သင့်အီးမေးလ်/SMS ဖြင့် အတည်ပြုချက်ပေးပို့ပါမည်။
          </p>
          <div className="mb-6 rounded-lg border border-border bg-muted/40 p-4">
            <p className="mb-2 text-sm text-muted-foreground">ချိန်းဆိုမှုအသေးစိတ်</p>
            <p className="font-medium text-foreground">{t.booking.videoConsultation}</p>
            <p className="text-muted-foreground">{selectedDate} တွင် {selectedTime}</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="btn-primary w-full">
            Dashboard သို့ သွားမည်
          </button>
        </div>
      </div>
    );
  }

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedPayment);

  return (
    <div className="landing-page booking-page min-h-screen px-4 py-8">
      <div className="booking-page__glow" aria-hidden />
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-link mb-4 flex items-center gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              နောက်သို့
            </button>
            <h1 className="myanmar-heading text-3xl font-bold text-slate-100">{t.booking.title}</h1>
            <p className="myanmar-text mt-1 text-slate-400">ဒေါက်တာထွန်းမြတ်ဝင်းနှင့် ချိန်းဆိုပါ</p>
          </div>
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'my' : 'en')}
            className="btn-link btn-link--icon shrink-0 rounded-xl border border-border bg-card/80 px-4 py-2 shadow-md backdrop-blur-md"
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span className="text-sm">{language === 'en' ? 'မြန်မာ' : 'English'}</span>
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="clinical-panel overflow-hidden">
              <div className="border-b border-border">
                <div className="flex">
                  {['အမျိုးအစား', 'နေ့ရက်', 'အသေးစိတ်', 'ငွေပေးချီမှု'].map((label, index) => (
                    <div
                      key={index}
                      className={`flex-1 py-4 text-center text-sm font-medium ${step > index
                        ? 'border-b-2 border-primary-400 text-primary-400'
                        : step === index + 1
                          ? 'border-b-2 border-primary-400 text-primary-400'
                          : 'text-muted-foreground/70'
                        }`}
                    >
                      {index + 1}. {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="myanmar-heading mb-4 font-semibold text-foreground">{t.booking.selectType}</h3>
                    <div className="grid gap-4">
                      {consultationTypes.map((type) => (
                        <div
                          key={type.type}
                          onClick={() => {
                            setSelectedType(type.type);
                            setValue('consultationType', type.type as 'video' | 'audio' | 'chat');
                          }}
                          className={`booking-option cursor-pointer p-4 ${selectedType === type.type ? 'booking-option--selected' : ''}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${selectedType === type.type ? 'bg-primary-500 text-white' : 'bg-muted text-muted-foreground'
                              }`}>
                              <type.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">
                                {t.booking[type.key as keyof typeof t.booking]}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {type.type === 'video' && 'ဆရာဝန်နှင့် မျက်နှာချင်းဆိုင် ဗီဒီယိုခေါ်ဆိုခြင်း'}
                                {type.type === 'audio' && 'အသံခေါ်ဆိုခြင်းဖြင့် ဆွေးနွေးခြင်း'}
                                {type.type === 'chat' && 'စာတိုပေးပို့ခြင်းဖြင့် ဆွေးနွေးခြင်း'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary-400">{type.price.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">ကျပ်</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="myanmar-heading mb-4 font-semibold text-foreground">{t.booking.selectDate}</h3>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {availableDates.map((dateItem) => (
                          <button
                            key={dateItem.date}
                            type="button"
                            onClick={() => handleDateSelect(dateItem.date)}
                            className={`w-16 shrink-0 rounded-xl py-3 text-center transition-all ${selectedDate === dateItem.date
                              ? 'bg-primary-500 text-white'
                              : 'bg-muted/80 text-muted-foreground hover:bg-primary-500/15 hover:text-foreground'
                              }`}
                          >
                            <p className="text-xs">{dateItem.day}</p>
                            <p className="text-lg font-bold">{dateItem.dayNum}</p>
                            <p className="text-xs">{dateItem.month}</p>
                          </button>
                        ))}
                      </div>
                      {errors.date && (
                        <p className="mt-2 text-sm text-red-500">{errors.date.message}</p>
                      )}
                    </div>

                    <div>
                      <h3 className="myanmar-heading mb-4 font-semibold text-foreground">{t.booking.selectTime}</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => handleTimeSelect(time)}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${selectedTime === time
                              ? 'bg-primary-500 text-white'
                              : 'bg-muted/80 text-muted-foreground hover:bg-primary-500/15 hover:text-foreground'
                              }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                      {errors.time && (
                        <p className="mt-2 text-sm text-red-500">{errors.time.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        {t.booking.symptoms}
                      </label>
                      <textarea
                        {...register('reason')}
                        rows={4}
                        className="input-field"
                        placeholder={t.booking.symptomsPlaceholder}
                      />
                      {errors.reason && (
                        <p className="mt-1 text-sm text-red-500">{errors.reason.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        {t.booking.additionalNotes}
                      </label>
                      <textarea
                        {...register('notes')}
                        rows={3}
                        className="input-field"
                        placeholder={t.booking.notesPlaceholder}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        ကျန်းမာရေးမှတ်တမ်းများ တင်ပေးပါ (ဓာတ်ပုံ, PDF, စာသား)
                      </label>
                      <div className="rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary-400">
                        <input
                          type="file"
                          id="healthRecords"
                          multiple
                          accept="image/*,.pdf,.txt,.doc,.docx"
                          onChange={handleHealthRecordsChange}
                          className="hidden"
                        />
                        <label htmlFor="healthRecords" className="cursor-pointer">
                          <Upload className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">ဖိုင်များ ရွေးချယ်ပါ သို့မဟုတ် ဒရော့လှုပ်ပါ</p>
                          <p className="mt-1 text-xs text-muted-foreground/80">ဓာတ်ပုံ, PDF, စာသား ဖိုင်များ လက်ခံပါသည်</p>
                        </label>
                      </div>
                      {healthRecordPreviews.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          {healthRecordPreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              {preview.startsWith('data:image') ? (
                                <img src={preview} alt={`Health record ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                              ) : (
                                <div className="flex h-24 w-full items-center justify-center rounded-lg bg-muted/80">
                                  <span className="text-xs text-muted-foreground">{healthRecords[index].name}</span>
                                </div>
                              )}
                              <button
                                onClick={() => handleRemoveHealthRecord(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-primary-500/20 bg-primary-500/10 p-4">
                      <h4 className="mb-2 font-medium text-primary-300">{t.booking.beforeConsultation}</h4>
                      <ul className="space-y-1 text-sm text-primary-200/90">
                        <li>• {t.booking.tips[0]}</li>
                        <li>• {t.booking.tips[1]}</li>
                        <li>• {t.booking.tips[2]}</li>
                      </ul>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <h3 className="myanmar-heading mb-4 font-semibold text-foreground">{t.booking.payment}</h3>
                    <div className="grid gap-3">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          onClick={() => handlePaymentMethodClick(method.id)}
                          className={`booking-option flex cursor-pointer items-center gap-4 p-4 ${selectedPayment === method.id ? 'booking-option--selected' : ''}`}
                        >
                          <span className="text-2xl">{method.logo}</span>
                          <span className="font-medium text-foreground">{method.name}</span>
                          {selectedPayment === method.id && (
                            <CheckCircle className="ml-auto h-5 w-5 text-primary-400" />
                          )}
                        </div>
                      ))}
                    </div>

                    {showPaymentDetails && selectedPaymentMethod && (
                      <div className="mt-4 rounded-xl border border-primary-500/20 bg-primary-500/10 p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <Smartphone className="h-6 w-6 text-primary-400" />
                          <h4 className="font-semibold text-foreground">ငွေပေးချေမှု အချက်အလက်</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between rounded-lg border border-border bg-card/80 p-3">
                            <span className="text-sm text-muted-foreground">ဖုန်းနံပါတ်</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-primary-400">{selectedPaymentMethod.phone}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(selectedPaymentMethod.phone)}
                                className="rounded p-1 hover:bg-muted/50"
                                title="ကူးယူမည်"
                              >
                                <Copy className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-border bg-card/80 p-3">
                            <span className="text-sm text-muted-foreground">အကောင့်နာမည်</span>
                            <span className="font-bold text-foreground">{selectedPaymentMethod.accountName}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        ငွေပေးချေမှု ဓာတ်ပုံ တင်ပေးပါ
                      </label>
                      <div className="rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary-400">
                        <input
                          type="file"
                          id="paymentScreenshot"
                          accept="image/*"
                          onChange={handlePaymentScreenshotChange}
                          className="hidden"
                        />
                        <label htmlFor="paymentScreenshot" className="cursor-pointer">
                          {paymentScreenshotPreview ? (
                            <div className="relative inline-block">
                              <img src={paymentScreenshotPreview} alt="Payment screenshot" className="max-h-48 rounded-lg" />
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRemovePaymentScreenshot();
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">ဓာတ်ပုံ ရွေးချယ်ပါ သို့မဟုတ် ဒရော့လှုပ်ပါ</p>
                              <p className="mt-1 text-xs text-muted-foreground/80">PNG, JPG ဖိုင်များ လက်ခံပါသည်</p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-muted-foreground">ဆွေးနွေးခ</span>
                        <span className="font-medium text-foreground">{consultationTypes.find(t => t.type === selectedType)?.price.toLocaleString()} ကျပ်</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-foreground">{t.booking.total}</span>
                        <span className="text-primary-400">{consultationTypes.find(t => t.type === selectedType)?.price.toLocaleString()} ကျပ်</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="btn-secondary order-2 w-full min-h-11 shrink-0 sm:order-1 sm:w-auto"
                    >
                      {t.booking.previous}
                    </button>
                  ) : (
                    <div className="hidden sm:block sm:min-w-0 sm:flex-1" aria-hidden="true" />
                  )}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="btn-primary order-1 w-full min-h-11 shrink-0 sm:order-2 sm:ml-auto sm:w-auto"
                    >
                      {t.booking.continue}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="btn-success order-1 flex min-h-11 w-full flex-wrap items-center justify-center gap-2 sm:order-2 sm:ml-auto sm:w-auto sm:max-w-md"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t.booking.processing}
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          {consultationTypes.find(t => t.type === selectedType)?.price.toLocaleString()} ကျပ် ပေးမည်
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="clinical-panel sticky top-8 p-6">
              <h3 className="myanmar-heading mb-4 font-semibold text-slate-100">ချိန်းဆိုမှုအနှစ်ချုပ်</h3>

              <div className="flex items-center gap-4 border-b border-border pb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/15">
                  <User className="h-7 w-7 text-primary-400" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">ဒေါက်တာထွန်းမြတ်ဝင်း</h4>
                  <p className="text-sm text-muted-foreground">အမျိုးသားကျန်းမာရေး</p>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-muted-foreground">၄.၉ (၁၂၅၀ ရိုက်ချက်များ)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-b border-border py-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">အမျိုးအစား</span>
                  <span className="font-medium text-foreground">{t.booking[consultationTypes.find(t => t.type === selectedType)?.key as keyof typeof t.booking]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">နေ့ရက်</span>
                  <span className="font-medium text-foreground">{selectedDate || 'မရွေးရသေးပါ'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">အချိန်</span>
                  <span className="font-medium text-foreground">{selectedTime || 'မရွေးရသေးပါ'}</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{t.booking.total}</span>
                  <span className="text-2xl font-bold text-primary-400">
                    {consultationTypes.find(t => t.type === selectedType)?.price.toLocaleString()} ကျပ်
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
