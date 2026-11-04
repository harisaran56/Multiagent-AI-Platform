import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';
import { hideToast } from '../../redux/ideSlice';

export default function IdeToast() {
  const dispatch = useDispatch();
  const { toast } = useSelector(state => state.ide);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      dispatch(hideToast());
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  const getStyle = () => {
    switch (toast.type) {
      case "success":
        return {
          icon: CheckCircle2,
          border: "border-emerald-500/40",
          bg: "bg-[#0f1d19]/95",
          iconColor: "text-emerald-400",
          title: "Success"
        };
      case "error":
        return {
          icon: AlertCircle,
          border: "border-rose-500/40",
          bg: "bg-[#201015]/95",
          iconColor: "text-rose-400",
          title: "Error"
        };
      case "warn":
        return {
          icon: AlertTriangle,
          border: "border-amber-500/40",
          bg: "bg-[#221b10]/95",
          iconColor: "text-amber-400",
          title: "Notice"
        };
      default:
        return {
          icon: Info,
          border: "border-indigo-500/40",
          bg: "bg-[#13151f]/95",
          iconColor: "text-indigo-400",
          title: "Information"
        };
    }
  };

  const style = getStyle();
  const Icon = style.icon;

  return (
    <AnimatePresence>
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`fixed top-5 right-5 z-50 flex items-start gap-3 p-3.5 rounded-xl border ${style.border} ${style.bg} backdrop-blur-md shadow-2xl max-w-sm w-full select-none`}
      >
        <div className={`p-1.5 rounded-lg bg-black/20 ${style.iconColor} shrink-0`}>
          <Icon size={16} />
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-xs font-semibold text-slate-200">{style.title}</p>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
            {toast.message}
          </p>
        </div>

        <button
          onClick={() => dispatch(hideToast())}
          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

