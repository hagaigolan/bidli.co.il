import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ChevronDown, LayoutDashboard, LogOut, MessageCircleQuestion, Package, ShieldCheck, Store, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function getInitial(name, email) {
  const base = name?.trim() || email?.trim() || "?";
  return base.charAt(0).toUpperCase();
}

function getDisplayName(name, email) {
  if (name?.trim()) return name.trim();
  if (email?.trim()) return email.trim().split("@")[0];
  return "משתמש";
}

export default function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.User.filter({ email: user.email })
      .then(us => setIsAdmin(us.length > 0 && us[0].role === "admin"))
      .catch(() => {});
  }, [user?.email]);

  if (!isAuthenticated || !user) return null;

  const name = getDisplayName(user.full_name, user.email);

  const handleLogout = () => {
    logout(false);
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 px-2 h-9 rounded-xl border border-gray-200 bg-white hover:border-[#e5893d66] hover:bg-orange-50/40 transition-all"
          dir="rtl"
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}
          >
            {getInitial(user.full_name, user.email)}
          </span>
          <span className="hidden sm:inline text-sm font-semibold text-gray-700 max-w-[120px] truncate">
            {name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56" dir="rtl">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-gray-800 truncate">{name}</span>
            {user.email && (
              <span className="text-xs text-gray-400 truncate" dir="ltr">{user.email}</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/my-center" className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="h-4 w-4 text-[#e5893d]" />
            <span>המרכז שלי</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
            <UserIcon className="h-4 w-4 text-[#e5893d]" />
            <span>עריכת פרופיל</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/my-orders" className="flex items-center gap-2 cursor-pointer">
            <Package className="h-4 w-4 text-[#e5893d]" />
            <span>ההזמנות שלי</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/my-sales" className="flex items-center gap-2 cursor-pointer">
            <Store className="h-4 w-4 text-[#e5893d]" />
            <span>המכירות שלי</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/seller-questions" className="flex items-center gap-2 cursor-pointer">
            <MessageCircleQuestion className="h-4 w-4 text-[#e5893d]" />
            <span>פניות ושאלות</span>
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin/manage" className="flex items-center gap-2 cursor-pointer">
              <ShieldCheck className="h-4 w-4 text-[#3e6b8a]" />
              <span>ניהול משתמשים ומכרזים</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          <span>התנתקות</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}