'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Loader2, User as UserIcon, Phone, Calendar, Users, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api/client';
import { updateMyAvatar } from '@/lib/api/users';
import type { User } from '@/types';
import { useLocale } from '@/components/providers/LocaleProvider';

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT_EXPO } },
};

type FormState = {
  full_name: string;
  phone: string;
  gender: '' | 'male' | 'female' | 'other';
  birth_date: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

interface ProfileData extends User {
  has_password: boolean;
}

function fieldCls(error?: string) {
  return `w-full rounded-xl border px-4 py-2.5 text-sm text-stone-900 outline-none transition-colors
    placeholder:text-stone-400 focus:ring-2 focus:ring-amber-400/50
    ${error
      ? 'border-rose-400 bg-rose-50 focus:border-rose-400'
      : 'border-stone-200 bg-white hover:border-stone-300 focus:border-amber-400'}`;
}

const EMPTY: FormState = { full_name: '', phone: '', gender: '', birth_date: '' };

function toForm(u: ProfileData): FormState {
  return {
    full_name:  u.full_name ?? '',
    phone:      u.phone ?? '',
    gender:     (u.gender as FormState['gender']) ?? '',
    birth_date: u.birth_date ? u.birth_date.slice(0, 10) : '',
  };
}

function isDirty(orig: FormState, curr: FormState) {
  return (Object.keys(orig) as (keyof FormState)[]).some(k => orig[k] !== curr[k]);
}

function validate(form: FormState, copy: ReturnType<typeof useLocale>['messages']['profile']): FormErrors {
  const e: FormErrors = {};
  if (!form.full_name.trim()) e.full_name = copy.fullNameRequired;
  else if (form.full_name.trim().length < 2) e.full_name = copy.fullNameShort;
  if (form.phone && !/^[0-9]{9,11}$/.test(form.phone))
    e.phone = copy.phoneInvalid;
  return e;
}

export default function ProfilePage() {
  const { messages } = useLocale();
  const { user, setAuth, token } = useAuthStore();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [orig, setOrig] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const setField = useCallback(<K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  }, []);

  useEffect(() => {
    api.get<{ success: boolean; data: ProfileData }>('/users/me')
      .then(({ data }) => {
        const initial = toForm(data.data);
        setForm(initial);
        setOrig(initial);
      })
      .catch(() => toast.error(messages.profile.loadFailed))
      .finally(() => setFetching(false));
  }, [messages.profile.loadFailed]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form, messages.profile);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload: Partial<FormState> = {};
      if (form.full_name)  payload.full_name  = form.full_name.trim();
      if (form.phone)      payload.phone      = form.phone;
      if (form.gender)     payload.gender     = form.gender;
      if (form.birth_date) payload.birth_date = form.birth_date;

      const { data } = await api.put<{ success: boolean; data: ProfileData }>('/users/me', payload);
      const saved = toForm(data.data);
      setForm(saved);
      setOrig(saved);
      if (token && user) {
        setAuth(token, { ...user, full_name: data.data.full_name });
      }
      toast.success(messages.profile.saved);
    } catch {
      toast.error(messages.profile.saveFailed);
    } finally {
      setLoading(false);
    }
  };

  const dirty = isDirty(orig, form);

  const handleAvatarChange = async (file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error(messages.profile.imageTypes);
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error(messages.profile.imageSize);
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('READ_FAILED'));
      reader.readAsDataURL(file);
    });

    setAvatarUploading(true);
    try {
      const updated = await updateMyAvatar(dataUrl);
      if (token && user) {
        setAuth(token, { ...user, avatar_url: updated.avatar_url });
      }
      toast.success(messages.profile.avatarSaved);
    } catch {
      toast.error(messages.profile.avatarFailed);
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <AccountLayout>
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-stone-900">{messages.profile.title}</h1>
          <p className="mt-1 text-sm text-stone-500">{messages.profile.intro}</p>
        </div>

        {fetching ? (
          <div className="flex items-center justify-center rounded-2xl border border-stone-200 bg-white py-20 shadow-soft">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white shadow-soft">
            {/* Avatar */}
            <div className="border-b border-stone-100 px-6 py-5">
              <p className="mb-4 text-sm font-semibold text-stone-700">{messages.profile.avatar}</p>
              <div className="flex items-center gap-4">
                {user?.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.full_name}
                    width={72}
                    height={72}
                    className="rounded-full object-cover ring-4 ring-amber-100"
                    style={{ width: 72, height: 72 }}
                    unoptimized
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span
                    className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-2xl font-bold text-white"
                    style={{ width: 72, height: 72 }}
                  >
                    {user?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                )}
                <div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => void handleAvatarChange(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                  >
                    {avatarUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                    {avatarUploading ? messages.profile.uploading : messages.profile.changeAvatar}
                  </button>
                  {user?.avatar_url && (
                    <p className="mt-1.5 text-xs text-stone-400">{messages.profile.avatarSynced}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} noValidate className="space-y-5 px-6 py-5">
              <div className="grid gap-5 md:grid-cols-2">
                {/* Full name */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-600">
                    <UserIcon className="h-3.5 w-3.5" />
                    {messages.profile.fullName} <span className="ml-0.5 text-rose-500">*</span>
                  </label>
                  <input
                    value={form.full_name}
                    onChange={e => setField('full_name', e.target.value)}
                    placeholder={messages.profile.fullName}
                    className={fieldCls(errors.full_name)}
                  />
                  {errors.full_name && <p className="mt-1 text-xs text-rose-500">{errors.full_name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-600">
                    <Phone className="h-3.5 w-3.5" /> {messages.profile.phone}
                  </label>
                  <input
                    value={form.phone}
                    onChange={e => setField('phone', e.target.value)}
                    placeholder="0901234567"
                    inputMode="numeric"
                    className={fieldCls(errors.phone)}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-600">
                    <Users className="h-3.5 w-3.5" /> {messages.profile.gender}
                  </label>
                  <select
                    value={form.gender}
                    onChange={e => setField('gender', e.target.value as FormState['gender'])}
                    className={fieldCls()}
                  >
                    <option value="">{messages.profile.select}</option>
                    <option value="male">{messages.profile.male}</option>
                    <option value="female">{messages.profile.female}</option>
                    <option value="other">{messages.profile.other}</option>
                  </select>
                </div>

                {/* Birth date */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-600">
                    <Calendar className="h-3.5 w-3.5" /> {messages.profile.birthDate}
                  </label>
                  <input
                    type="date"
                    value={form.birth_date}
                    onChange={e => setField('birth_date', e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    className={fieldCls()}
                  />
                </div>
              </div>

              {/* Email read-only */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-600">
                  <Mail className="h-3.5 w-3.5" /> Email
                </label>
                <input
                  value={user?.email ?? ''}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-400"
                />
                <p className="mt-1 text-xs text-stone-400">{messages.profile.emailLocked}</p>
              </div>

              <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                {dirty ? (
                  <p className="text-xs font-medium text-amber-600">{messages.profile.unsaved}</p>
                ) : (
                  <p className="text-xs text-stone-400">{messages.profile.clean}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !dirty}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {messages.profile.saveChanges}
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </AccountLayout>
  );
}
