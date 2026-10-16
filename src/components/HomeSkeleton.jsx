// שלדי טעינה לדף הבית — מוצגים בזמן טעינת הנתונים הראשונה במקום עמוד ריק
export default function HomeSkeleton() {
  return (
    <div dir="rtl" aria-busy="true" aria-label="טוען את דף הבית">
      {/* פס מדדים */}
      <section className="py-5 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse" />
              <div className="h-5 w-10 rounded bg-gray-100 animate-pulse" />
              <div className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
      {/* מדור מכרזים */}
      <section className="py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-5 w-40 rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-gray-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}