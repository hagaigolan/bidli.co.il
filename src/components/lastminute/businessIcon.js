import { Mic, Scissors, Stethoscope, Sparkles, Camera, Dumbbell, GraduationCap, Store } from "lucide-react";

const ICONS = {
  "אולפן הקלטות": Mic,
  "מספרה / ספר": Scissors,
  "קליניקה וטיפולים": Stethoscope,
  "קוסמטיקה וציפורניים": Sparkles,
  "צילום": Camera,
  "כושר ואימון אישי": Dumbbell,
  "שיעורים פרטיים": GraduationCap,
  "אחר": Store,
};

export function businessIcon(type) {
  return ICONS[type] || Store;
}

export default businessIcon;