import React from "react";
import { Button } from "@/components/ui/button";

const SwitchOption = ({
  isPassword,
  setIsPassword,
}: {
  isPassword: boolean;
  setIsPassword: any;
}) => {
  return (
    <div className="dark:border-strokedark mx-auto mb-8 flex flex-col items-center justify-center gap-2.5 rounded-lg border border-stroke bg-gray p-2 dark:border-dark-3 dark:bg-gray-800 md:flex-row ">
      <Button
        variant={!isPassword ? "default" : "ghost"}
        className="w-full text-base"
        onClick={() => setIsPassword(false)}
      >
        Magic Link
      </Button>
      <Button
        variant={isPassword ? "default" : "ghost"}
        className="w-full text-base"
        onClick={() => setIsPassword(true)}
      >
        Password
      </Button>
    </div>
  );
};

export default SwitchOption;
