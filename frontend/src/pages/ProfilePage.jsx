import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const [form, setForm] = React.useState({ name: '', email: '', phone: '' });
    const [errors, setErrors] = React.useState({});
    const [success, setSuccess] = React.useState('');

    const isEditOpen = searchParams.get('edit') === '1';
    const fallbackEmail = (user?.phone || form.phone) ? `${(user?.phone || form.phone)}@mobile.local` : '';

    React.useEffect(() => {
        setForm({
            name: user?.name || '',
            email: user?.email || fallbackEmail,
            phone: user?.phone || ''
        });
    }, [user]);

    const initials = (user?.name || user?.role || 'U')
        .split(' ')
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');

    const openEdit = () => {
        setSuccess('');
        setSearchParams({ edit: '1' });
    };
    const closeEdit = () => setSearchParams({});

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = 'This field is required.';
        else if (form.name.trim().length < 3) next.name = 'Full name must be at least 3 characters.';

        if (!form.email.trim()) next.email = 'This field is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Please enter a valid email address.';

        if (form.phone && !/^\d+$/.test(form.phone)) next.phone = 'Phone Number must be numeric.';

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const onSave = (e) => {
        e.preventDefault();
        if (!validate()) return;

        updateUser({
            ...user,
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim()
        });
        setSuccess('Profile updated successfully.');
        closeEdit();
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-900">
            <div className="rounded-3xl border p-8 shadow-xl bg-white border-zinc-200">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full flex items-center justify-center text-lg font-black bg-zinc-900 text-white">
                            {initials}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-zinc-900">{t('myProfile')}</h1>
                            <p className="text-sm text-zinc-500">{t('yourAccountDetails')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isEditOpen ? (
                            <button
                                onClick={openEdit}
                                className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm font-bold hover:bg-zinc-800"
                                aria-label="Edit profile"
                            >
                                {t('editProfile')}
                            </button>
                        ) : (
                            <button
                                onClick={closeEdit}
                                className="rounded-xl border px-4 py-2 text-sm font-bold border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                aria-label="Cancel"
                            >
                                {t('cancel')}
                            </button>
                        )}
                    </div>
                </div>

                {!!success && <p className="text-sm font-semibold text-emerald-600 mb-4">{success}</p>}

                {!isEditOpen ? (
                    <div className="grid gap-4">
                        <div className="rounded-2xl border p-4 border-zinc-200">
                            <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">{t('fullName')}</p>
                            <p className="text-lg font-semibold mt-1 text-zinc-900">{user?.name || '-'}</p>
                        </div>
                        <div className="rounded-2xl border p-4 border-zinc-200">
                            <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">{t('emailAddress')}</p>
                            <p className="text-lg font-semibold mt-1 text-zinc-900">{user?.email || fallbackEmail || '-'}</p>
                        </div>
                        <div className="rounded-2xl border p-4 border-zinc-200">
                            <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">{t('phoneNumber')}</p>
                            <p className="text-lg font-semibold mt-1 text-zinc-900">{user?.phone || '-'}</p>
                        </div>
                        <div className="rounded-2xl border p-4 border-zinc-200">
                            <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">{t('role')}</p>
                            <p className="text-lg font-semibold mt-1 text-zinc-900">{user?.role || '-'}</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={onSave} className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-zinc-700">{t('fullName')}</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 border-zinc-200 text-zinc-900"
                            />
                            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-zinc-700">{t('emailAddress')}</label>
                            <input
                                value={form.email}
                                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 border-zinc-200 text-zinc-900"
                            />
                            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-zinc-700">{t('phoneNumber')}</label>
                            <input
                                value={form.phone}
                                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                                className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 border-zinc-200 text-zinc-900"
                            />
                            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="submit" className="flex-1 rounded-xl bg-zinc-900 text-white py-2.5 text-sm font-bold hover:bg-zinc-800">
                                {t('saveChanges')}
                            </button>
                            <button
                                type="button"
                                onClick={closeEdit}
                                className="flex-1 rounded-xl border py-2.5 text-sm font-bold border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
