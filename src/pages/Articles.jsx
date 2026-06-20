import { Link } from "react-router-dom";
import { ArrowRight, Clock, Calendar, Tag } from "lucide-react";

export const ARTICLES = [
  {
    id: "auction-guide",
    title: "מדריך מלא למכירה במכרזים - איך להשיג את המחיר הטוב ביותר",
    excerpt: "כל הסודות להצלחה במכרזים: תמחור נכון, תזמון מושלם, וכתיבת תיאור מושך שיקפיץ את ההצעות.",
    content: `# מדריך מלא למכירה במכרזים

מכרזים מקוונים הפכו לאחת הדרכים הפופולריות ביותר למכור פריטי אספנות, אמנות, ומוצרים ייחודיים. אבל איך מבטיחים שהפריט שלכם יגיע למחיר המקסימלי האפשרי?

## תמחור אסטרטגי

הטעות הנפוצה ביותר היא מחיר התחלתי גבוה מדי. מחקר מראה שמחיר התחלתי נמוך ב-30-40% מהערך המשוער מושך יותר מציעים ויוצר תחרות שמניבה מחיר סופי גבוה יותר.

## כתיבת תיאור מנצח

התיאור הוא כלי המכירה העיקרי. השתמשו במבנה: פתיחה מושכת, פרטים טכניים, היסטוריה, מצב הפריט, ומידע על משלוח.

## צילום מקצועי

תמונות איכותיות מעלות את שווי הפריט: תאורה טובה, רקע נקי, זוויות מרובות, ותקריבי פרטים.

## תזמון המכרז

ערבי שבת ושעות 20:00-22:00 הם הזמנים הטובים ביותר. הימנעו מחגים. משך אופטימלי: 5-7 ימים.

[לפרסום מכרז עכשיו](/upload-product)`,
    tags: ["מדריכים", "מכירה", "טיפים"],
    readTime: 8,
    author: "דני כהן",
    date: "2026-06-15",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop"
  },
  {
    id: "art-collecting-guide",
    title: "איסוף אמנות למתחילים - איך לבנות אוסף משמעותי בתקציב מוגבל",
    excerpt: "כל מה שצריך לדעת לפני שקונים יצירת אמנות ראשונה: זיהוי סגנונות, הערכת שווי, והימנעות מטעויות יקרות.",
    content: `# איסוף אמנות למתחילים

אמנות יכולה להיות השקעה מספקת ומרגשת. המדריך הזה יעזור לכם להתחיל את המסע ברגל ימין.

## למה לאסוף אמנות?

- אהבה אישית והנאה אסתטית
- השקעה לטווח ארוך
- תמיכה באמנים מקומיים

## הגדרת תקציב

מתחילים (500-2000 ש"ח): הדפסים מוגבלים, אמנים צעירים.
בינוני (2000-10000 ש"ח): יצירות מקוריות.
מתקדמים (10000+ ש"ח): שמות מוכרים.

## סגנונות עיקריים

אמנות מופשטת, פיגורטיבית, עכשווית, וישראלית.

## הערכת שווי

גורמים: שם האמן, נדירות, מצב היצירה, פרובנאנס, חתימה.

[גלו מכרזי אמנות](/category/אמנות)`,
    tags: ["אמנות", "אספנות", "מדריכים"],
    readTime: 10,
    author: "יעל לוי",
    date: "2026-06-10",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=400&fit=crop"
  },
  {
    id: "spot-fakes",
    title: "איך לזהות זיופים - מדריך לאספן החשדן",
    excerpt: "סימני אזהרה, טכניקות זיהוי, וכלים שיאפשרו לכם לקנות בביטחון ולהימנע מהונאות יקרות.",
    content: `# איך לזהות זיופים

שוק העתיקות והאספנות מלא בפריטים מרתקים, אבל גם בזיופים מתוחכמים.

## דגלים אדומים

- מחיר נמוך מדי
- לחץ זמן מהמוכר
- חוסר שקיפות
- פרובנאנס מעורפל
- חתימה חשודה

## טכניקות זיהוי

השתמשו במגדלת, אור UV, ומגנט לבדיקת מתכות.

## הגנה עצמית

חקרו את המוכר, בקשו תיעוד, התייעצו עם מומחה.

[גלו מכרזים פעילים](/auctions)`,
    tags: ["זיופים", "אספנות", "טיפים"],
    readTime: 9,
    author: "רחל גולן",
    date: "2026-06-05",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop"
  },
  {
    id: "investment-guide",
    title: "השקעה אלטרנטיבית - למה אספנות יכולה להניב תשואה טובה ממניות",
    excerpt: "ניתוח השוואתי של תשואות מאספנות לעומת שוק ההון, פיזור סיכונים, ואסטרטגיות השקעה חכמות.",
    content: `# השקעה אלטרנטיבית

בעוד ששוק ההון מספק תשואה ממוצעת של 7-10% בשנה, פריטי אספנות נדירים יכולים להניב תשואות גבוהות יותר.

## יתרונות

- תשואה פוטנציאלית גבוהה
- פיזור תיק השקעות
- הנאה אישית מהפריטים

## סיכונים

- נזילות נמוכה
- צריך ידע מקצועי
- שוק תנודתי

## אסטרטגיות

התמקדו בקטגוריות עם ביקוש עקבי, קנו באיכות הגבוהה ביותר שאתם יכולים להרשות.

[למדו עוד על השקעות](/articles/investment-guide)`,
    tags: ["השקעות", "פיננסים", "אספנות"],
    readTime: 7,
    author: "יוסי ממן",
    date: "2026-05-28",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop"
  },
  {
    id: "vintage-furniture",
    title: "מדריך לריהוט וינטג' - איך לזהות פריטים איכותיים",
    excerpt: "הכל על ריהוט וינטג': תקופות עיצוב, זיהוי חתימות יצרנים, שימור ושחזור, והערכת שווי.",
    content: `# מדריך לריהוט וינטג'

ריהוט וינטג' הוא השקעה יפהפייה ופרקטית.

## תקופות עיצוב

ארט דקו (1920-1940), אמצע המאה (1950-1960), פוסט מודרני (1970-1980).

## זיהוי איכות

חפשו חיבורי זכר-נקבה, עץ מלא, חתימות יצרן.

## טיפול

ניקוי עדין, הימנעו מאור שמש ישיר, שעווה פעם בשנה.

[גלו ריהוט במכרזים](/category/עיצוב הבית)`,
    tags: ["וינטג'", "ריהוט", "עיצוב"],
    readTime: 6,
    author: "מיכל ברק",
    date: "2026-05-20",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=400&fit=crop"
  },
  {
    id: "coins-guide",
    title: "אספנות מטבעות - מהבסיס עד רמה מתקדמת",
    excerpt: "עולם הנומיסמטיקה פתוח בפניכם: דירוג מטבעות, אחסון נכון, זיהוי טעויות טביעה נדירות.",
    content: `# אספנות מטבעות

נומיסמטיקה היא תחביב מרתק עם היסטוריה עשירה.

## התחלה

התמקדו במטבעות ישראליים או תקופה היסטורית אחת.

## דירוג

מצב המטבע קובע את ערכו: UNC (לא במחזור), XF (מצב מצוין), VF (מצב טוב מאוד).

## אחסון

קפסולות אטומות, כפפות כותנה, מקום יבש.

[מטבעות במכרז](/category/מטבעות)`,
    tags: ["מטבעות", "נומיסמטיקה", "אספנות"],
    readTime: 8,
    author: "אבי רוזנברג",
    date: "2026-05-15",
    image: "https://images.unsplash.com/photo-1624365169364-0640dd10e180?w=800&h=400&fit=crop"
  },
  {
    id: "jewelry-authentication",
    title: "זיהוי תכשיטים אמיתיים - מדריך לקונים חכמים",
    excerpt: "איך להבדיל בין זהב אמיתי לציפוי, לזהות אבנים יקרות, ולפענח חותמות יצרנים מפורסמים.",
    content: `# זיהוי תכשיטים

קניית תכשיטי וינטג' דורשת ידע וזהירות.

## סימני טביעה

חפשו חותמות: 14K, 18K, 750 לזהב; 925 לכסף.

## אבנים יקרות

יהלומים אמיתיים קרים למגע, מעבירים אור.

## יצרנים מפורסמים

קרטייה, טיפאני, בולגרי - לכל אחד סימנים ייחודיים.

[תכשיטים במכרז](/category/תכשיטים)`,
    tags: ["תכשיטים", "זהב", "זיהוי"],
    readTime: 7,
    author: "נועה גולדשטיין",
    date: "2026-05-10",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=400&fit=crop"
  },
  {
    id: "stamps-collecting",
    title: "בולים נדירים - עולם שלם בתוך פיסת נייר",
    excerpt: "מדריך מקיף לאספנות בולים: דירוג, אחסון, זיהוי בולים נדירים, והיסטוריה של הבול הראשון בישראל.",
    content: `# אספנות בולים

פילטליה היא תחביב קלאסי עם קהילה תוססת.

## התחלה

השיגו אלבום בולים, פינצטה, ומגדלת.

## בולים נדירים

שגיאות הדפסה, בולים עם שוליים, גיליונות מלאים.

## אחסון

אלבומים ללא חומצה, כפפות, מקום יבש ומוצל.

[בולים במכרז](/category/בולים)`,
    tags: ["בולים", "פילטליה", "אספנות"],
    readTime: 6,
    author: "דוד לוי",
    date: "2026-05-05",
    image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&h=400&fit=crop"
  },
  {
    id: "wine-collecting",
    title: "אספנות יין - מהכרם לאוסף הפרטי",
    excerpt: "כל מה שצריך לדעת על אספנות יין: אחסון בטמפרטורה נכונה, זיהוי יקבים נחשקים, והערכת שווי בקבוקים נדירים.",
    content: `# אספנות יין

יין הוא השקעה שניתן גם ליהנות ממנה.

## אחסון

13-15 מעלות, 70% לחות, חושך מוחלט.

## יקבים נחשקים

בורדו צרפת, נאפה ואלי קליפורניה, יקבים ישראליים מובילים.

## תאריך שתייה

לא כל יין משתבח עם הזמן - שתו בחלון הזמן המתאים.

[יין במכרז](/category/יין ואלכוהול)`,
    tags: ["יין", "אלכוהול", "אספנות"],
    readTime: 7,
    author: "אמיר שטרן",
    date: "2026-04-28",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=400&fit=crop"
  },
  {
    id: "watch-collecting",
    title: "שעוני יוקרה - מדריך לאספן המתחיל",
    excerpt: "עולם שעוני היוקרה: מותגים היסטוריים, מנגנוני אוטומטיים, זיהוי זיופים, והשקעה לטווח ארוך.",
    content: `# אספנות שעונים

שעוני יוקרה הם שילוב של אמנות והנדסה.

## מותגים מובילים

רולקס, אומגה, פטק פיליפ, אודמר פיגה.

## מנגנונים

אוטומטי (מתיחה עצמית), קוורץ (סוללה), ידני.

## זיהוי זיופים

משקל, חריטה, תנועת מחוגים - זיופים לרוב קלים יותר.

[שעונים במכרז](/category/שעונים)`,
    tags: ["שעונים", "יוקרה", "אספנות"],
    readTime: 8,
    author: "רונן כהן",
    date: "2026-04-20",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=400&fit=crop"
  }
];

export default function Articles() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero */}
      <div className="border-b border-gray-100 py-10 px-4" style={{ background: "linear-gradient(135deg, #f700ff08, #9d00ff05)" }}>
        <div className="max-w-5xl mx-auto">
          <a href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
            חזרה לדף הבית
          </a>
          <h1 className="text-3xl font-black text-gray-900 mb-2">מאמרים</h1>
          <p className="text-gray-500 text-sm">מדריכים, טיפים ותובנות לעולם האספנות והמכרזים</p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid gap-8">
          {ARTICLES.map(article => (
            <Link key={article.id} to={`/articles/${article.id}`}
              className="flex flex-col md:flex-row gap-6 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="w-full md:w-80 h-48 md:h-auto overflow-hidden bg-gray-50 flex-shrink-0">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {article.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#f700ff10", color: "#f700ff" }}>{tag}</span>
                    ))}
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mb-2 group-hover:text-[#f700ff] transition-colors">{article.title}</h2>
                  <p className="text-gray-500 text-sm mb-4">{article.excerpt}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime} דק׳ קריאה</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(article.date).toLocaleDateString("he-IL")}</span>
                  <span className="flex items-center gap-1">✍️ {article.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}