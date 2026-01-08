import { Check } from "lucide-react";

const OfferList = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Check className="h-3 w-3" />
      </div>
      <p className="text-base text-slate-600 dark:text-slate-400 font-medium">{text}</p>
    </div>
  );
};

export default OfferList;
