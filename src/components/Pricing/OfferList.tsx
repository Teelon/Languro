const OfferList = ({ text }: { text: string }) => {
  return (
    <p className={`mb-1 text-base text-slate-600 dark:text-slate-400`}>{text}</p>
  );
};

export default OfferList;
