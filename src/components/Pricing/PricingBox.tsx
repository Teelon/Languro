import axios from "axios";
import React from "react";
import OfferList from "./OfferList";
import { Price } from "@/types/price";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PricingBox = ({ product }: { product: Price }) => {
  // POST request
  const handleSubscription = async (e: any) => {
    e.preventDefault();
    const { data } = await axios.post(
      "/api/payment",
      {
        priceId: product.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    window.location.assign(data);
  };

  return (
    <div className="w-full px-4 md:w-1/2 lg:w-1/3">
      <Card
        className="relative z-10 mb-10 overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:bg-slate-800"
        data-wow-delay=".1s"
      >
        {product.nickname === "Commander" && (
          <div className="absolute top-0 right-0">
            <span className="inline-block bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white rounded-bl-lg">
              Recommended
            </span>
          </div>
        )}

        <CardHeader className="pt-8 text-center pb-2">
          {product.nickname === "Commander" && (
            <Badge variant="default" className="mx-auto mb-4 w-fit bg-primary/10 text-primary border-primary/20">Popular</Badge>
          )}
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {product.nickname}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center pt-4">
          <div className="mb-8">
            <span className="text-5xl font-extrabold text-slate-900 dark:text-white">
              ${(product.unit_amount / 100).toLocaleString("en-US", { currency: "USD", minimumFractionDigits: 0 })}
            </span>
            <span className="text-lg text-slate-500 dark:text-slate-400 font-medium">/mo</span>
          </div>

          <div className="mb-8 flex flex-col gap-4 text-left px-2">
            {product?.offers.map((offer, i) => (
              <OfferList key={i} text={offer} />
            ))}
          </div>
        </CardContent>

        <CardFooter className="pb-8">
          <Button
            onClick={handleSubscription}
            className={`w-full text-base font-bold py-6 transition-all duration-300 ${product.nickname === "Commander"
                ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900"
              }`}
            size="lg"
          >
            Start Training
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PricingBox;
