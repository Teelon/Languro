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
        {product.nickname === "Premium" && (
          <div className="absolute right-0 top-0 h-16 w-16">
            <div className="absolute right-[-34px] top-[32px] w-[170px] rotate-45 transform bg-primary py-1 text-center text-sm font-semibold text-white shadow-sm">
              Recommended
            </div>
          </div>
        )}

        <CardHeader className="pt-8 text-center">
          {product.nickname === "Premium" && (
            <Badge variant="secondary" className="mx-auto mb-4 w-fit">Popular</Badge>
          )}
          <CardTitle className="text-xl font-medium text-slate-900 dark:text-white">
            {product.nickname}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center">
          <div className="mb-8">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">
              ${(product.unit_amount / 100).toLocaleString("en-US", { currency: "USD" })}
            </span>
            <span className="text-base text-slate-600 dark:text-slate-400"> / month</span>
          </div>

          <div className="mb-8 flex flex-col gap-3 text-left">
            {product?.offers.map((offer, i) => (
              <OfferList key={i} text={offer} />
            ))}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleSubscription}
            className="w-full"
            variant={product.nickname === "Premium" ? "default" : "outline"}
            size="lg"
          >
            Purchase Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PricingBox;
