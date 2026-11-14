export type Service = {
  id: string;
  platform: string;
  name: string;
  nameAr: string;
  blurb: string;
  icon: string;
};

export type Platform = {
  id: string;
  name: string;
  nameAr: string;
  blurb: string;
  icon: string;
};

export const PLATFORMS: Platform[] = [
  { id: "stores", name: "ربط المتجر", nameAr: "ابدأ من هنا", blurb: "اربط متجرك على سلة أو زد أو Shopify أو WooCommerce بأدوات التتبع والمنصات الإعلانية.", icon: "store" },
  { id: "google", name: "Google", nameAr: "جوجل", blurb: "إعلانات البحث والتسوق ويوتيوب، مع أدوات التتبع والتحليل ومركز التجار.", icon: "google" },
  { id: "meta", name: "Meta", nameAr: "ميتا", blurb: "إعلانات فيسبوك وإنستغرام، والبكسل والجماهير المخصصة.", icon: "meta" },
  { id: "tiktok", name: "TikTok", nameAr: "تيك توك", blurb: "إعلانات تيك توك من إنشاء الحساب حتى قراءة النتائج.", icon: "tiktok" },
  { id: "snapchat", name: "Snapchat", nameAr: "سناب شات", blurb: "إعلانات سناب شات والبكسل وصيغ الإعلان.", icon: "snapchat" },
  { id: "linkedin", name: "LinkedIn", nameAr: "لينكدإن", blurb: "إعلانات موجهة للشركات وأصحاب القرار.", icon: "linkedin" },
  { id: "x", name: "X", nameAr: "إكس (تويتر سابقاً)", blurb: "إعلانات منصة إكس والبكسل والجماهير.", icon: "x" },
  { id: "basics", name: "أساسيات التسويق", nameAr: "قبل أن تعلن", blurb: "اختيار المنصة، المحتوى العضوي، التصميم، وكتابة النص الإعلاني.", icon: "basics" },
];

export const SERVICES: Service[] = [
  { id: "salla", platform: "stores", name: "سلة", nameAr: "ربط متجر سلة", blurb: "ربط متجر سلة بأدوات Google والبكسلات الإعلانية.", icon: "salla" },
  { id: "zid", platform: "stores", name: "زد", nameAr: "ربط متجر زد", blurb: "ربط متجر زد بأدوات Google والبكسلات الإعلانية.", icon: "zid" },
  { id: "shopify", platform: "stores", name: "Shopify", nameAr: "ربط متجر شوبيفاي", blurb: "ربط متجر Shopify بمركز التجار والبكسلات.", icon: "shopify" },
  { id: "woocommerce", platform: "stores", name: "WooCommerce", nameAr: "ربط متجر ووكومرس / ووردبريس", blurb: "تثبيت الأكواد والإضافات في متاجر WordPress.", icon: "woocommerce" },

  { id: "google-ads", platform: "google", name: "Google Ads", nameAr: "إعلانات جوجل", blurb: "حملات البحث و Performance Max و Demand Gen و Display والتسوق والتطبيقات.", icon: "googleads" },
  { id: "youtube-ads", platform: "google", name: "YouTube Ads", nameAr: "إعلانات يوتيوب", blurb: "صيغ إعلانات الفيديو وإنشاء حملاتها من Google Ads.", icon: "youtube" },
  { id: "merchant-center", platform: "google", name: "Merchant Center", nameAr: "مركز التجار", blurb: "خلاصة المنتجات، التحقق من الموقع، وحل تعليق الحساب.", icon: "merchant" },
  { id: "tag-manager", platform: "google", name: "Tag Manager", nameAr: "مدير الوسوم", blurb: "تثبيت أكواد التتبع وإدارتها من مكان واحد.", icon: "tagmanager" },
  { id: "analytics", platform: "google", name: "Analytics 4", nameAr: "تحليلات جوجل", blurb: "قياس الزيارات والمبيعات وقراءة التقارير.", icon: "analytics" },
  { id: "search-console", platform: "google", name: "Search Console", nameAr: "مشرفو المواقع", blurb: "ظهور متجرك في نتائج البحث المجانية وتشخيص مشاكله.", icon: "searchconsole" },

  { id: "facebook-ads", platform: "meta", name: "Facebook Ads", nameAr: "إعلانات فيسبوك", blurb: "مدير الإعلانات، أهداف الحملات، والجماهير والمواضع.", icon: "facebook" },
  { id: "instagram-ads", platform: "meta", name: "Instagram Ads", nameAr: "إعلانات إنستغرام", blurb: "ترويج المنشورات وحملات الزيارات والرسائل والمبيعات.", icon: "instagram" },
  { id: "meta-pixel", platform: "meta", name: "Meta Pixel", nameAr: "بكسل ميتا والجماهير", blurb: "إنشاء البكسل وتثبيته واختباره، والجماهير المخصصة والمشابهة.", icon: "meta" },

  { id: "tiktok-ads", platform: "tiktok", name: "TikTok Ads", nameAr: "إعلانات تيك توك", blurb: "الحساب الإعلاني، البكسل، والحملة خطوة بخطوة.", icon: "tiktok" },
  { id: "snapchat-ads", platform: "snapchat", name: "Snapchat Ads", nameAr: "إعلانات سناب شات", blurb: "الحساب الإعلاني، Snap Pixel، والحملة خطوة بخطوة.", icon: "snapchat" },
  { id: "linkedin-ads", platform: "linkedin", name: "LinkedIn Ads", nameAr: "إعلانات لينكدإن", blurb: "صفحة الشركة، الاستهداف المهني، ونماذج العملاء المحتملين.", icon: "linkedin" },
  { id: "x-ads", platform: "x", name: "X Ads", nameAr: "إعلانات إكس", blurb: "أهداف الحملات، بكسل إكس، والجماهير المخصصة.", icon: "x" },

  { id: "marketing-basics", platform: "basics", name: "التسويق والمحتوى", nameAr: "أساسيات التسويق والمحتوى", blurb: "ما تحتاج معرفته قبل الإعلانات المدفوعة.", icon: "basics" },
];

export const platformOf = (id: string) => PLATFORMS.find((p) => p.id === id);
export const serviceOf = (id: string) => SERVICES.find((s) => s.id === id);
export const servicesOf = (platform: string) => SERVICES.filter((s) => s.platform === platform);
export const WHATSAPP_NUMBER = "966531098287";
