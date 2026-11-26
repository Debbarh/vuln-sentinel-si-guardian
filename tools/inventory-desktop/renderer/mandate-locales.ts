const fr = {
  title: 'Périmètre réseau autorisé', fetch: 'Récupérer le mandat',
  help: 'Le périmètre et les horaires sont définis par votre administrateur dans la console. Cette vérification ne lance aucun scan. Le moteur de découverte sera intégré dans un prochain lot.',
  empty: 'Aucun mandat récupéré dans cette session.', expires: 'Validité locale jusqu’au', revision: 'Révision',
  targets: 'Adresses autorisées après exclusions', ranges: 'Réseaux autorisés', exclusions: 'Exclusions',
  profile: 'Profil local requis', window: 'Fenêtre quotidienne', cadence: 'Intervalle (minutes)',
  status: { expired: 'Mandat expiré : nouvelle vérification requise', missing: 'Aucun périmètre configuré',
    disabled: 'Découverte désactivée dans la console', outside_window: 'En dehors de la fenêtre autorisée',
    profile_missing: 'Profil SNMP local à préparer', ready: 'Conditions du mandat réunies · moteur non activé' },
};
type Texts = { [K in keyof typeof fr]: typeof fr[K] extends string ? string : { [P in keyof typeof fr[K]]: string } };
const en: Texts = {
  title: 'Authorised network scope', fetch: 'Retrieve mandate',
  help: 'Your administrator defines the scope and schedule in the console. This check starts no scan. The discovery engine will be integrated in a later delivery.',
  empty: 'No mandate retrieved in this session.', expires: 'Local validity until', revision: 'Revision',
  targets: 'Authorised addresses after exclusions', ranges: 'Authorised networks', exclusions: 'Exclusions',
  profile: 'Required local profile', window: 'Daily window', cadence: 'Interval (minutes)',
  status: { expired: 'Mandate expired: check again', missing: 'No scope configured',
    disabled: 'Discovery disabled in the console', outside_window: 'Outside the authorised window',
    profile_missing: 'Prepare the local SNMP profile', ready: 'Mandate conditions met · engine not enabled' },
};
const ar: Texts = {
  title: 'نطاق الشبكة المصرح به', fetch: 'جلب التفويض',
  help: 'يحدد مسؤولك النطاق والمواعيد في لوحة التحكم. هذا التحقق لا يبدأ أي فحص. سيدمج محرك الاكتشاف في مرحلة لاحقة.',
  empty: 'لم يتم جلب تفويض في هذه الجلسة.', expires: 'الصلاحية المحلية حتى', revision: 'المراجعة',
  targets: 'العناوين المصرح بها بعد الاستثناءات', ranges: 'الشبكات المصرح بها', exclusions: 'الاستثناءات',
  profile: 'الملف المحلي المطلوب', window: 'الفترة اليومية', cadence: 'الفاصل بالدقائق',
  status: { expired: 'انتهى التفويض: يلزم تحقق جديد', missing: 'لم يتم إعداد نطاق',
    disabled: 'الاكتشاف معطل في لوحة التحكم', outside_window: 'خارج الفترة المصرح بها',
    profile_missing: 'يلزم إعداد ملف SNMP المحلي', ready: 'شروط التفويض مستوفاة · المحرك غير مفعل' },
};
const ary: Texts = {
  title: 'نطاق الشبكة المرخص', fetch: 'جيب الترخيص',
  help: 'المسؤول كيحدد النطاق والمواعيد فلوحة التحكم. هاد التحقق ما كيبدا حتى فحص. محرك الاكتشاف غادي يتزاد فمرحلة جاية.',
  empty: 'ما تجاب حتى ترخيص فهاد الجلسة.', expires: 'الصلاحية المحلية حتى', revision: 'المراجعة',
  targets: 'العناوين المرخصة من بعد الاستثناءات', ranges: 'الشبكات المرخصة', exclusions: 'الاستثناءات',
  profile: 'البروفيل المحلي المطلوب', window: 'الفترة اليومية', cadence: 'المدة بالدقائق',
  status: { expired: 'سالات صلاحية الترخيص: خاص تحقق جديد', missing: 'ما تجهز حتى نطاق',
    disabled: 'الاكتشاف موقف فلوحة التحكم', outside_window: 'برا الوقت المرخص',
    profile_missing: 'خاص يتوجد بروفيل SNMP المحلي', ready: 'شروط الترخيص متوفرة · المحرك ما مفعلش' },
};
export const mandateLocales = { fr, en, ar, ary };
